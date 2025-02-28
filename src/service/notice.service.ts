import { Notices } from "@/entity/notices.entity";
import { CrawlerService } from "@/service/crawler.service";
import { EVENT_TOPIC, EventService } from "@/service/event.service";
import { NoticeAuthorService } from "@/service/notice-author.service";
import { HREF_TO_URL, SCHOOL_DOMAIN } from "@/share/const/school-domain";
import { withCrawlerPageClose } from "@/share/decorator/with-crawler-page";
import { dataSource } from "@/share/lib/typeorm/data-source";
import { ElementHandle, Page } from "puppeteer";
import { Repository } from "typeorm";

export class NoticeService {
  page?: Page;
  constructor(
    private noticeRepository: Repository<Notices>,
    private crawlerService: CrawlerService,
    private noticeAuthorService: NoticeAuthorService
  ) {}

  public static async get() {
    const crawlerService = await CrawlerService.get();
    const noticeAuthorService = await NoticeAuthorService.get();
    return new NoticeService(
      dataSource.getRepository(Notices), //
      crawlerService,
      noticeAuthorService
    );
  }

  @withCrawlerPageClose()
  public async findNewNoticeUsingCrawling() {
    if (!this.page) {
      throw new Error("page is not define");
    }

    await this.page.goto(`${SCHOOL_DOMAIN}/tukorea/7607/subview.do`);

    const elements = await this.crawlerService.findByCSSSelector(
      this.page,
      "a:has(span[class*='new'])"
      // "//a[.//span[contains(@class, 'new')]]"
    );

    const responses = await Promise.allSettled(
      //
      elements.map((el) => this.elementToNotice(el))
    );

    const newNotices = responses.map((re) => {
      if (re.status === "fulfilled") {
        return re.value;
      } else {
        console.log("element can't convert notice");
        throw new Error(re.reason);
      }
    });

    return newNotices.sort((a, b) => a.id - b.id);
  }

  public async filterNotExist(notices: Notices[]) {
    const newNotices = [];
    for (const notice of notices) {
      const findNotice = await this.noticeRepository.findOne({
        where: { id: notice.id },
      });
      if (!findNotice) {
        await this.noticeRepository.save(notice);
        newNotices.push(notice);
      }
    }

    return newNotices;
  }

  // node-cron에 의해 실행되는 작업
  // 새로운 공지사항을 크롤링 하고 이벤트 발행
  public async cronJob() {
    const findNewNotices = await this.findNewNoticeUsingCrawling();
    const savedNewNotice = await this.filterNotExist(findNewNotices);

    const eventService = await EventService.get();

    savedNewNotice.forEach((notice) => {
      eventService.publishEvent(
        EVENT_TOPIC.NOTICE,
        JSON.stringify(notice.toJSON())
      );
    });
  }

  public async elementToNotice(element: ElementHandle<Element>) {
    const aTag = await element.toElement("a");

    const data = await aTag.evaluate(async (el) => {
      const href = el.href;

      const title = el.querySelector<HTMLDivElement>(
        "div[class='title'] > strong"
      )?.innerText;

      console.log(`title: ${title} 새로운 공지사항`);

      const id = Number(
        el.querySelector<HTMLDivElement>("dl[class='num'] > dd")?.innerText
      );

      const authorName = el.querySelector<HTMLDivElement>(
        "dl[class='writer'] > dd"
      )?.innerText;

      return { href, title, id, authorName };
    });

    for (const [key, value] of Object.entries(data)) {
      if (!value) throw new Error(`공지사항을 Notice로 변환 불가능함 ${key}`);
    }

    const { authorName, href, id, title } = data;

    const author = await this.noticeAuthorService.upsertNoticeAuthorByName(
      authorName!
    );

    const newNotice = this.noticeRepository.create({
      id,
      url: HREF_TO_URL(href),
      title,
    });

    newNotice.author = author;

    return newNotice;
  }
}
