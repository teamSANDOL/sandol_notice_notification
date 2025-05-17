import { AmqpService, EventTopic } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { NoticeAuthorService } from "@/crawler/notice-author/notice-author.service";
import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { ElementHandle } from "puppeteer";
import { Repository } from "typeorm";

@Injectable()
export class DormitoryNoticeService {
  private readonly logger = new Logger(DormitoryNoticeService.name);

  constructor(
    @InjectRepository(DormitoryNotices)
    private dormitoryNoticeRepository: Repository<DormitoryNotices>,

    @Inject(CrawlerService)
    private crawlerService: CrawlerService,

    @Inject(NoticeAuthorService)
    private noticeAuthorService: NoticeAuthorService,

    @Inject(AmqpService)
    private amqpService: AmqpService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.amqpService.subscribeEvent(
      "NOTICE_DORMITORY QUEUE",
      EventTopic.enum.NoticeDormitory,
      (content: string) => {
        console.log(
          "AMQP로 새로운 기숙사 공지사항",
          JSON.parse(content)["title"],
          "를 받았습니다.",
        );
      },
    );
    await this.cronJob();
  }

  // node-cron에 의해 실행되는 작업
  // 새로운 기숙사 공지사항을 크롤링 하고 이벤트 발행
  // 30초마다
  @Interval("dormitory notice crawler", 1000 * 30)
  public async cronJob() {
    const findNewNotices = await this.findNewNoticeUsingCrawling();
    const savedNewNotice = await this.filterNotExist(findNewNotices);
    savedNewNotice.forEach((notice) => {
      console.log(`새로운 기숙사 공지사항: ${notice.title}`);
      this.amqpService.publishEvent(
        EventTopic.enum.NoticeDormitory,
        JSON.stringify(notice.toJSON()),
      );
    });
  }

  public async findNewNoticeUsingCrawling() {
    return new Promise<DormitoryNotices[]>((resolve) => {
      this.crawlerService.startCraw(async (page) => {
        await page.goto("https://dorm.tukorea.ac.kr/dorm/2630/subview.do");

        const elements = await this.crawlerService.findByCSSSelector(
          page,
          "a:has(span[class*='new'])",
        );

        const responses = await Promise.allSettled(
          elements.map((el) => this.elementToNotice(el)),
        );

        const newNotices = responses
          .filter((response) => response.status === "fulfilled")
          .map((re) => re.value);

        resolve(newNotices.sort((a, b) => a.id - b.id));
      });
    });
  }

  public async filterNotExist(notices: DormitoryNotices[]) {
    const newNotices: DormitoryNotices[] = [];
    for (const notice of notices) {
      const findNotice = await this.dormitoryNoticeRepository.findOne({
        where: { id: notice.id },
      });
      if (!findNotice) {
        await this.dormitoryNoticeRepository.save(notice);
        newNotices.push(notice);
      }
    }

    return newNotices;
  }

  public async elementToNotice(element: ElementHandle<Element>) {
    const aTag = await element.toElement("a");

    const rawData = await aTag.evaluate(async (el) => {
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

    // Validate all required fields exist
    for (const [key, value] of Object.entries(rawData)) {
      if (!value)
        throw new Error(
          `기숙사 공지사항을 DormitoryNotice로 변환 불가능함 ${key}`,
        );
    }

    const { href, title, id, authorName } = rawData;

    const author = await this.noticeAuthorService.upsertNoticeAuthorByName(
      authorName!,
    );

    const newNotice = this.dormitoryNoticeRepository.create({
      id,
      url: `${href}?layout=unknown`,
      title,
    });

    newNotice.author = author;

    return newNotice;
  }
}
