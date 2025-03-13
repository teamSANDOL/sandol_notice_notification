import { ShuttleSchedules } from "@/entity/shuttle-schedules.entity";
import { CrawlerService } from "@/service/crawler.service";
import { EventService } from "@/service/event.service";
import { withCrawlerPageClose } from "@/share/decorator/with-crawler-page";
import { dataSource } from "@/share/lib/typeorm/data-source";
import { ElementHandle, Page } from "puppeteer";
import { Repository } from "typeorm";

export class ShuttleScheduleService {
  page?: Page;

  constructor(
    private shuttleScheduleRepository: Repository<ShuttleSchedules>,
    private crawlerService: CrawlerService
  ) {}
  public static async get() {
    const crawlerService = await CrawlerService.get();
    return new ShuttleScheduleService(
      dataSource.getRepository(ShuttleSchedules), //
      crawlerService
    );
  }

  public async cronJob() {
    const findNewShuttleSchedule = await this.findImageElementUsingCrawling();
    const savedNewShuttleSchedule = await this.filterNotExist(
      findNewShuttleSchedule
    );

    const eventService = await EventService.get();

    savedNewShuttleSchedule.forEach((schedule) => {
      eventService.publishEvent(
        "SHUTTLE_SCHEDULE",
        JSON.stringify(schedule.toJSON())
      );
    });
  }

  @withCrawlerPageClose()
  private async findImageElementUsingCrawling() {
    if (!this.page) {
      throw new Error("page is not define");
    }

    await this.page.goto("https://ibook.kpu.ac.kr/Viewer/bus01");

    const elements = await this.crawlerService.findByCSSSelector(
      this.page,
      "img[class*='pageImage']"
    );

    const responses = await Promise.allSettled(
      //
      elements.map((el) => this.elementToShuttleSchedule(el))
    );

    const newShuttleSchedule = responses.map((re) => {
      if (re.status === "fulfilled") {
        return re.value;
      } else {
        console.log("element can't convert notice");
        throw new Error(re.reason);
      }
    });

    return newShuttleSchedule;
  }

  private async filterNotExist(shuttleSchedules: ShuttleSchedules[]) {
    const newShuttleSchedule = [];
    for (const schedule of shuttleSchedules) {
      const findNotice = await this.shuttleScheduleRepository.findOne({
        where: { imageUrl: schedule.imageUrl },
      });
      if (!findNotice) {
        await this.shuttleScheduleRepository.save(schedule);
        newShuttleSchedule.push(schedule);
      }
    }

    return newShuttleSchedule;
  }

  private async elementToShuttleSchedule(element: ElementHandle<Element>) {
    const imgTag = await element.toElement("img");

    const data = await imgTag.evaluate(async (el) => {
      const imageUrl = el.src;

      const place = el.getAttribute("aria-label")?.split("\n")?.at(3) ?? "";

      return { imageUrl, place };
    });

    for (const [key, value] of Object.entries(data)) {
      if (!value) throw new Error(`공지사항을 Notice로 변환 불가능함 ${key}`);
    }

    const { imageUrl, place } = data;

    const newShuttleSchedule = this.shuttleScheduleRepository.create({
      imageUrl,
      place,
    });

    return newShuttleSchedule;
  }
}
