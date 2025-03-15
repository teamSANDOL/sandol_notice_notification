import { NoticeRestService } from "@/api/notice-rest/notice-rest.service";
import { PaginationQuery } from "@/api/share/pagination-query";
import { Controller, Get, Inject, Query } from "@nestjs/common";

@Controller("notice")
export class NoticeRestController {
  constructor(
    @Inject(NoticeRestService)
    private noticeRestService: NoticeRestService,
  ) {}

  @Get()
  public async findRecent(@Query() query: PaginationQuery) {
    return await this.noticeRestService.findAll(query);
  }
}
