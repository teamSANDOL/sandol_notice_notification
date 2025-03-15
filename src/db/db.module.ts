import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Notices } from "@/db/entity/notices.entity";
import { SchoolMealMenu } from "@/db/entity/school-meal-menu.entity";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NODE_ENV } from "src/config/config.module";

export const isProduction = process.env.NODE_ENV === "production";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host:
        NODE_ENV.LOCAL === process.env.NODE_ENV
          ? "localhost"
          : process.env.POSTGRES_HOST,
      // port: 3306,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        Notices,
        NoticeAuthors,
        DormitoryNotices,
        SchoolMealMenu,
        ShuttleSchedules,
      ],
      synchronize: true,
    }),
  ],

  // exports: [TypeOrmModule],
})
export class DbModule {}
