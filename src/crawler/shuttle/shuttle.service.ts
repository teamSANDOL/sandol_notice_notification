import { AmqpService, EventTopic } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import _ from "lodash";
import { ElementHandle } from "puppeteer";
import { In, Repository } from "typeorm";

@Injectable()
export class ShuttleService {
  constructor(
    @InjectRepository(ShuttleSchedules)
    private shuttleRepository: Repository<ShuttleSchedules>,

    @Inject(CrawlerService)
    private crawlerService: CrawlerService,

    @Inject(AmqpService)
    private amqpService: AmqpService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.amqpService.subscribeEvent(
      "SHUTTLE SCHEDULE",
      EventTopic.enum.ShuttleSchedule,
      (message: string) => {
        console.log(
          "AMQP로 새로운 셔틀버스 시간표",
          JSON.parse(message)["place"],
          "를 받았습니다.",
        );
      },
    );

    await this.crawlShuttleSchedule();
  }

  // node-cron에 의해 실행되는 작업
  // 새로운 셔틀 시간표를 크롤링 하고 이벤트 발행
  // 30초마다
  async crawlShuttleSchedule() {
    const newShuttleSchedules = await this.findNewNoticeUsingCrawling();
    const notExistShuttleSchedules =
      await this.filterNotExist(newShuttleSchedules);

    notExistShuttleSchedules.forEach((shuttleSchedule) => {
      console.log("새로운 셔틀버스 시간표", shuttleSchedule.place);
      this.amqpService.publishEvent(
        EventTopic.enum.ShuttleSchedule,
        JSON.stringify(shuttleSchedule),
      );
    });
  }

  async findNewNoticeUsingCrawling() {
    return new Promise<ShuttleSchedules[]>((resolve) => {
      this.crawlerService.startCraw(async (page) => {
        await page.goto(`https://ibook.kpu.ac.kr/Viewer/bus01`);

        const imageElements = await this.crawlerService.findByCSSSelector(
          page,
          "img[class*='pageImage']",
        );

        const responses = await Promise.allSettled(
          imageElements.map((el) => this.elementToShuttleSchedule(el)),
        ).catch((err) => {
          console.log(err);
          return [] as PromiseSettledResult<ShuttleSchedules>[];
        });

        const newShuttleSchedules = responses
          .filter((re) => re.status === "fulfilled")
          .map((v) => v.value);

        resolve(newShuttleSchedules);
      });
    });
  }

  async filterNotExist(shuttleSchedules: ShuttleSchedules[]) {
    const existShuttleSchedules = await this.shuttleRepository.find({
      where: { imageUrl: In(_.map(shuttleSchedules, (v) => v.imageUrl)) },
    });

    const notExistShuttleSchedules = _.differenceWith(
      shuttleSchedules,
      existShuttleSchedules,
      (sS, eS) => sS.imageUrl === eS.imageUrl,
    );

    await this.shuttleRepository.save(notExistShuttleSchedules);

    return notExistShuttleSchedules;
  }

  async elementToShuttleSchedule(
    element: ElementHandle<Element>,
  ): Promise<ShuttleSchedules> {
    const iamgeTag = await element.toElement("img");

    const data = await iamgeTag.evaluate(async (el) => {
      const imageUrl = el.src;
      let place = "";
      if (el.alt === "1페이지") {
        place = "본교 ↔ 정왕역";
      } else if (el.alt === "2페이지") {
        place = "제2캠퍼스 ↔ 본교 ↔ 정왕역";
      }

      return { imageUrl, place };
    });

    return this.shuttleRepository.create({
      imageUrl: data.imageUrl,
      place: data.place,
    });
  }
}
