import { DormitoryNoticeRestController } from "@/api/dormitory-notice-rest/dormitory-notice-rest.controller";
import { DormitoryNoticeRestService } from "@/api/dormitory-notice-rest/dormitory-notice-rest.service";
import { NoticeRestController } from "@/api/notice-rest/notice-rest.controller";
import { NoticeRestService } from "@/api/notice-rest/notice-rest.service";
import { ShuttleRestController } from "@/api/shuttle-rest/shuttle-rest.controller";
import { ShuttleRestService } from "@/api/shuttle-rest/shuttle-rest.service";
import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Notices } from "@/db/entity/notices.entity";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notices,
      NoticeAuthors,
      ShuttleSchedules,
      DormitoryNotices,
    ]),
  ],
  providers: [
    NoticeRestService,
    DormitoryNoticeRestService,
    ShuttleRestService,
  ],
  controllers: [
    NoticeRestController,
    DormitoryNoticeRestController,
    ShuttleRestController,
  ],
})
export class ApiModule {}
