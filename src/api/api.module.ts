import { NoticeRestController } from "@/api/notice-rest/notice-rest.controller";
import { NoticeRestService } from "@/api/notice-rest/notice-rest.service";
import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Notices } from "@/db/entity/notices.entity";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notices, NoticeAuthors, ShuttleSchedules]),
  ],
  providers: [NoticeRestService],
  controllers: [NoticeRestController],
})
export class ApiModule {}
