/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HREF_TO_URL, SCHOOL_DOMAIN } from "@/config/school-domain";
import { AmqpService, EventTopic } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { NoticeAuthorService } from "@/crawler/notice-author/notice-author.service";
import { Notices } from "@/db/entity/notices.entity";
import { Inject, Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { ElementHandle } from "puppeteer";
import { Repository } from "typeorm";

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notices)
    private noticeRepository: Repository<Notices>,

    @Inject(CrawlerService)
    private crawlerService: CrawlerService,

    @Inject(NoticeAuthorService)
    private noticeAuthorService: NoticeAuthorService,

    @Inject(AmqpService)
    private amqpService: AmqpService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.amqpService.subscribeEvent(
      "NOTICE QUEUE",
      EventTopic.enum.Notice,
      (content: string) => {
        console.log(
          "AMQP로 새로운 공지사항",
          JSON.parse(content)["title"],
          "를 받았습니다.",
        );
      },
    );
    await this.cronJob();
  }

  // node-cron에 의해 실행되는 작업
  // 새로운 공지사항을 크롤링 하고 이벤트 발행
  // 30초마다
  @Interval("notice crawler", 1000 * 30)
  public async cronJob() {
    const findNewNotices = await this.findNewNoticeUsingCrawling();
    const savedNewNotice = await this.filterNotExist(findNewNotices);

    savedNewNotice.forEach((notice) => {
      console.log(`새로운 공지사항: ${notice.title}`);
      this.amqpService.publishEvent(
        EventTopic.enum.Notice,
        JSON.stringify(notice.toJSON()),
      );
    });
  }

  public async findNewNoticeUsingCrawling() {
    return new Promise<Notices[]>((resolve) => {
      this.crawlerService.startCraw(async (page) => {
        await page.goto(`${SCHOOL_DOMAIN}/tukorea/7607/subview.do`);

        const elements = await this.crawlerService.findByCSSSelector(
          page,
          "a:has(span[class*='new'])",
        );

        const responses = await Promise.allSettled(
          //
          elements.map((el) => this.elementToNotice(el)),
        );

        const newNotices = responses.map((re) => {
          if (re.status === "fulfilled") {
            return re.value;
          } else {
            console.log("element can't convert notice");
            throw new Error(re.reason);
          }
        });

        resolve(newNotices.sort((a, b) => a.id - b.id));
      });
    });
  }

  public async filterNotExist(notices: Notices[]) {
    const newNotices: Notices[] = [];
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

  public async elementToNotice(element: ElementHandle<Element>) {
    const aTag = await element.toElement("a");

    const data = await aTag.evaluate(async (el) => {
      const href = el.href;

      const title = el.querySelector<HTMLDivElement>(
        "div[class='title'] > strong",
      )?.innerText;

      const id = Number(
        el.querySelector<HTMLDivElement>("dl[class='num'] > dd")?.innerText,
      );

      const authorName = el.querySelector<HTMLDivElement>(
        "dl[class='writer'] > dd",
      )?.innerText;

      return { href, title, id, authorName };
    });

    for (const [key, value] of Object.entries(data)) {
      if (!value) throw new Error(`공지사항을 Notice로 변환 불가능함 ${key}`);
    }

    const { authorName, href, id, title } = data;

    const author = await this.noticeAuthorService.upsertNoticeAuthorByName(
      authorName!,
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
