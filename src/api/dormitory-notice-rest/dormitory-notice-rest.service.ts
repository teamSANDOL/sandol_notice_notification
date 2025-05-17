import {
  PaginationQuery,
  PaginationResult,
} from "@/api/share/pagination-query";
import { DormitoryNotices } from "@/db/entity/dormitory-notices.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class DormitoryNoticeRestService {
  constructor(
    @InjectRepository(DormitoryNotices)
    private dormitoryNoticeRepository: Repository<DormitoryNotices>,
  ) {}

  public async findAll(query: PaginationQuery): Promise<PaginationResult> {
    const { page, size } = query;
    const [items, total] = await this.dormitoryNoticeRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: "DESC" },
    });
    return PaginationResult.of({ items, total, page, size });
  }
}
