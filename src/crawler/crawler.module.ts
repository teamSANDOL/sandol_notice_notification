import { AmqpService } from "@/crawler/amqp/amqp.service";
import { CrawlerService } from "@/crawler/crawler/crawler.service";
import { NoticeService } from "@/crawler/notice/notice.service";
import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Notices } from "@/db/entity/notices.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoticeAuthorService } from "./notice-author/notice-author.service";

@Module({
  imports: [TypeOrmModule.forFeature([Notices, NoticeAuthors])],
  providers: [NoticeService, CrawlerService, NoticeAuthorService, AmqpService],
})
export class CrawlerModule {}
