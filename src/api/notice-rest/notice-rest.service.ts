import {
  PaginationQuery,
  PaginationResult,
} from "@/api/share/pagination-query";
import { Notices } from "@/db/entity/notices.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class NoticeRestService {
  constructor(
    @InjectRepository(Notices)
    private noticeRepository: Repository<Notices>,
  ) {}
  public async findAll(query: PaginationQuery): Promise<PaginationResult> {
    const { page, size } = query;
    const [items, total] = await this.noticeRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: "DESC" },
    });
    return PaginationResult.of({ items, total, page, size });
  }
}
