import { NoticeResponse } from "@/controller/notice/notice.response";
import { NoticeService } from "@/service/notice.service";
import { IsNumber, IsOptional, IsPositive } from "class-validator";
import "reflect-metadata";

import { Get, JsonController, Param } from "routing-controllers";

import { ResponseSchema } from "routing-controllers-openapi";

export class PaginationQuery {
  @IsNumber()
  @IsPositive()
  public page?: number;

  @IsNumber()
  @IsOptional()
  public size?: number;
}

@JsonController("/notice")
export class NoticeController {
  @Get("/:id")
  @ResponseSchema(NoticeResponse, { statusCode: 200, isArray: true })
  async getRecent(@Param("id") id: number) {
    console.log("id: ", id);
    const noticeService = await NoticeService.get();
    return await noticeService
      .findNoticePagination
      // query.page,
      // query.size,
      // query.cursor
      ();
  }
}
