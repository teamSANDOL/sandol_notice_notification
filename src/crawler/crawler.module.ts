import { AmqpService } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { DormitoryNoticeService } from "@/crawler/dormitory-notice/dormitory-notice.service";
import { NoticeService } from "@/crawler/notice/notice.service";
import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Notices } from "@/db/entity/notices.entity";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoticeAuthorService } from "./notice-author/notice-author.service";
import { ShuttleService } from "./shuttle/shuttle.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notices,
      NoticeAuthors,
      DormitoryNotices,
      ShuttleSchedules,
    ]),
  ],
  providers: [
    NoticeService,
    CrawlerService,
    NoticeAuthorService,
    AmqpService,
    DormitoryNoticeService,
    ShuttleService,
  ],
})
export class CrawlerModule {}
