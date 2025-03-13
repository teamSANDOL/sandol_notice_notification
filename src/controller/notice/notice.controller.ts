import { NoticeResponse } from "@/controller/notice/notice.response";
import { Get, JsonController } from "routing-controllers";

import { ResponseSchema } from "routing-controllers-openapi";

@JsonController("/notice")
export class NoticeController {
  @Get()
  @ResponseSchema(NoticeResponse, { isArray: true })
  async getRecent() {
    return [];
  }
}
