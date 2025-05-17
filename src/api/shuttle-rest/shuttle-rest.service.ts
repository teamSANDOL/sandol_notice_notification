import {
  PaginationQuery,
  PaginationResult,
} from "@/api/share/pagination-query";
import { ShuttleService } from "@/crawler/shuttle/shuttle.service";
import { ShuttleSchedules } from "@/db/entity/shuttle-schedules.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ShuttleRestService {
  constructor(
    @InjectRepository(ShuttleSchedules)
    private shuttleRepository: Repository<ShuttleSchedules>,
  ) {}

  public async findAll(query: PaginationQuery): Promise<PaginationResult> {
    const { page, size } = query;
    const [items, total] = await this.shuttleRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: "DESC" },
    });
    return PaginationResult.of({ items, total, page, size });
  }

  public async findRecentShuttleSchedule(): Promise<{
    primary?: ShuttleSchedules;
    second?: ShuttleSchedules;
  }> {
    // Find the two most recent unique places
    const primaryShuttleSchedule = await this.shuttleRepository.findOne({
      where: {
        place: ShuttleService.PLACES.PRIMARY,
      },
      order: {
        createdAt: "DESC",
      },
    });

    const secondShuttleSchedule = await this.shuttleRepository.findOne({
      where: {
        place: ShuttleService.PLACES.SECOND,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return {
      primary: primaryShuttleSchedule ?? undefined,
      second: secondShuttleSchedule ?? undefined,
    };
  }
}
