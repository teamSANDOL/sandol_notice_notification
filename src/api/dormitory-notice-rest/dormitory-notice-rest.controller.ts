import { DormitoryNoticeRestService } from "@/api/dormitory-notice-rest/dormitory-notice-rest.service";
import {
  PaginationQuery,
  PaginationResult,
} from "@/api/share/pagination-query";
import { Controller, Get, Inject, Query } from "@nestjs/common";

@Controller("dormitory-notice")
export class DormitoryNoticeRestController {
  constructor(
    @Inject(DormitoryNoticeRestService)
    private dormitoryNoticeRestService: DormitoryNoticeRestService,
  ) {}

  @Get()
  public async findRecent(
    @Query() query: PaginationQuery,
  ): Promise<PaginationResult> {
    const notices = await this.dormitoryNoticeRestService.findAll(query);
    return PaginationResult.of(notices);
  }
}
