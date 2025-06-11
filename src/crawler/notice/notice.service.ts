import { SCHOOL_DOMAIN } from "@/config/school-domain";
import { AmqpService, EventTopic } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { NoticeAuthorService } from "@/crawler/notice-author/notice-author.service";
import { Notices } from "@/db/entity/notices.entity";
import { Inject, Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { minify } from "html-minifier-terser";
import { ElementHandle } from "puppeteer";
import { In, Repository } from "typeorm";

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
    this.cronJob();
  }

  // node-cron에 의해 실행되는 작업
  // 새로운 공지사항을 크롤링 하고 이벤트 발행
  // 5분마다
  @Interval("notice crawler", 1000 * 60 * 5)
  public async cronJob() {
    const findNewNotices = await this.findNewNoticeUsingCrawling();

    if (findNewNotices.length === 0) return;

    await this.noticeRepository.save(findNewNotices);

    findNewNotices.forEach((notice) => {
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
        const existNotices = await this.noticeRepository.find({
          where: { id: In(noticeIds) },
        });
        const existNoticeIds = existNotices.map((notice) => notice.id);

        const newNoticeElements = elementWithIds
          .filter(({ id }) => !existNoticeIds.includes(id))
          .map(({ el }) => el);

        const responses = await Promise.allSettled(
          newNoticeElements.map((el) => this.elementToNotice(el)),
        );

        const newNotices = responses.map((re) => {
          if (re.status === "fulfilled") {
            return re.value;
          } else {
            console.log("element can't convert notice");
            throw new Error(re.reason as string);
          }
        });

        resolve(newNotices.sort((a, b) => a.id - b.id));
      });
    });
  }

  public async elementToNotice(element: ElementHandle<Element>) {
    const aTag = await element.toElement("a");

    const data = await aTag.evaluate(async (el) => {
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

    for (const [key, value] of Object.entries(data)) {
      if (!value) throw new Error(`공지사항을 Notice로 변환 불가능함 ${key}`);
    }

    const { authorName, href, id, title } = data;

    const { html, content } = await new Promise<{
      html: string;
      content: string;
    }>((resolve) => {
      this.crawlerService.startCraw(async (page) => {
        await page.goto(href);
        const html = await page.content();

        // class가 "contents"인 div 부분만 추출
        const contentDiv = await page.$("div[class='contents']");
        const content =
          (await contentDiv?.evaluate((el) => el.innerHTML)) ?? "";

        resolve({ html, content });
      });
    });

    const author = await this.noticeAuthorService.upsertNoticeAuthorByName(
      authorName!,
    );

    const newNotice = this.noticeRepository.create({
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
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
        minifyJS: true,
      }),
    });

    newNotice.author = author;

    return newNotice;
  }
}
