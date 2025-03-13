import { NoticeAuthorResponse } from "@/controller/notice-author/notice-author.response";
import { Notices } from "@/entity/notices.entity";
import { plainToInstance, Type } from "class-transformer";
import { IsDate, IsInt, IsString, ValidateNested } from "class-validator";
import "reflect-metadata";

export class NoticeResponse {
  @IsInt()
  id: number;

  @IsString()
  url: string;

  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => NoticeAuthorResponse)
  author: NoticeAuthorResponse;

  @IsDate()
  createdAt: Date;

  static of(notice: Notices) {
    return plainToInstance(NoticeResponse, notice);
  }
}
