import { NoticeRestService } from "@/api/notice-rest/notice-rest.service";
import {
  PaginationQuery,
  PaginationResult,
} from "@/api/share/pagination-query";
import { Controller, Get, Inject, Query } from "@nestjs/common";

@Controller("notice")
export class NoticeRestController {
  constructor(
    @Inject(NoticeRestService)
    private noticeRestService: NoticeRestService,
  ) {}

  @Get()
  public async findRecent(
    @Query() query: PaginationQuery,
  ): Promise<PaginationResult> {
    const notices = await this.noticeRestService.findAll(query);
    return PaginationResult.of(notices);
  }
}
