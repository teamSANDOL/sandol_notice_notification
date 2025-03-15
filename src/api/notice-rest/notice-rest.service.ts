import { PaginationQuery } from "@/api/share/pagination-query";
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
  async findAll(query: PaginationQuery) {
    return this.noticeRepository.find({
      order: {
        createdAt: "DESC",
      },
      take: query.size,
      skip: (query.page - 1) * query.size,
    });
  }
}
