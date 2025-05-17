import {
  PaginationQuery,
  PaginationResult,
} from "@/api/share/pagination-query";
import { ShuttleRestService } from "@/api/shuttle-rest/shuttle-rest.service";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Controller, Get, Inject, Query } from "@nestjs/common";

@Controller("shuttle")
export class ShuttleRestController {
  constructor(
    @Inject(ShuttleRestService)
    private shuttleRestService: ShuttleRestService,
  ) {}

  @Get()
  public async findAll(
    @Query() query: PaginationQuery,
  ): Promise<PaginationResult> {
    const schedules = await this.shuttleRestService.findAll(query);
    return PaginationResult.of(schedules);
  }

  @Get("recent")
  public async findRecentShuttleSchedule(): Promise<{
    primary?: ShuttleSchedules;
    second?: ShuttleSchedules;
  }> {
    return await this.shuttleRestService.findRecentShuttleSchedule();
  }
}
