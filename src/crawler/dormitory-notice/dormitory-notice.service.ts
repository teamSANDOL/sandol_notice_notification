import { AmqpService, EventTopic } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { NoticeAuthorService } from "@/crawler/notice-author/notice-author.service";
import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { Inject, Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { minify } from "html-minifier-terser";
import { ElementHandle } from "puppeteer";
import { In, Repository } from "typeorm";

@Injectable()
export class DormitoryNoticeService {
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
    this.cronJob();
  }

  // node-cron에 의해 실행되는 작업
  // 새로운 기숙사 공지사항을 크롤링 하고 이벤트 발행
  // 5분마다
  @Interval("dormitory notice crawler", 1000 * 60 * 5)
  public async cronJob() {
    const findNewNotices = await this.findNewNoticeUsingCrawling();

    if (findNewNotices.length === 0) return;

    await this.dormitoryNoticeRepository.save(findNewNotices);

    findNewNotices.forEach(async (notice) => {
      console.log(`새로운 기숙사 공지사항: ${notice.title}`);
      await this.amqpService.publishEvent(
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

        const elementWithIds = await Promise.all(
          elements.map(async (el) => ({
            el,
            id: await el.evaluate((el) =>
              Number(
                el.querySelector<HTMLDivElement>("dl[class='num'] > dd")
                  ?.innerText,
              ),
            ),
          })),
        );

        const noticeIds = elementWithIds.map(({ id }) => id);

        const existNotices = await this.dormitoryNoticeRepository.find({
          where: { id: In(noticeIds) },
        });

        const existNoticeIds = existNotices.map((notice) => notice.id);

        const newNoticeElements = elementWithIds
          .filter(({ id }) => !existNoticeIds.includes(id))
          .map(({ el }) => el);

        const responses = await Promise.allSettled(
          newNoticeElements.map((el) => this.elementToNotice(el)),
        );

        const newNotices = responses
          .filter(
            (response): response is PromiseFulfilledResult<DormitoryNotices> =>
              response.status === "fulfilled",
          )
          .map((re) => re.value);

        resolve(newNotices.sort((a, b) => a.id - b.id));
      });
    });
  }

  public async elementToNotice(element: ElementHandle<Element>) {
    const aTag = await element.toElement("a");

    const rawData = await aTag.evaluate(async (el) => {
      const href = `${el.href}?layout=unknown`;
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

    const { html, content } = await new Promise<{
      html: string;
      content: string;
    }>((resolve) => {
      this.crawlerService.startCraw(async (page) => {
        await page.goto(href);
        const html = await page.content();

        const contentDiv = await page.$("div[class='contents']");
        const content =
          (await contentDiv?.evaluate((el) => el.innerHTML)) ?? "";

        resolve({ html, content });
      });
    });

    const newNotice = this.dormitoryNoticeRepository.create({
      id,
      url: href,
      title,
      html: await minify(html, {
        collapseWhitespace: true, // 공백·줄바꿈 제거
        removeComments: true, // 주석 제거
        removeAttributeQuotes: true, // 속성 따옴표 제거
        minifyCSS: true,
        minifyJS: true,
      }),

      content: await minify(content, {
        collapseWhitespace: true, // 공백·줄바꿈 제거
        removeComments: true, // 주석 제거
        removeAttributeQuotes: true, // 속성 따옴표 제거
        minifyCSS: true,
        minifyJS: true,
      }),
    });

    newNotice.author = author;

    return newNotice;
  }
}
