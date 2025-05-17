import { AmqpService } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { DormitoryNoticeService } from "@/crawler/dormitory-notice/dormitory-notice.service";
import { NoticeService } from "@/crawler/notice/notice.service";
import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Notices } from "@/db/entity/notices.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoticeAuthorService } from "./notice-author/notice-author.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notices, NoticeAuthors, DormitoryNotices]),
  ],
  providers: [
    NoticeService,
    CrawlerService,
    NoticeAuthorService,
    AmqpService,
    DormitoryNoticeService,
  ],
})
export class CrawlerModule {}
