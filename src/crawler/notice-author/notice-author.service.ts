import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class NoticeAuthorService {
  constructor(
    @InjectRepository(NoticeAuthors)
    private noticeAuthorRepository: Repository<NoticeAuthors>,
  ) {}

  public async upsertNoticeAuthorByName(name: string) {
    let authors = await this.noticeAuthorRepository.findOne({
      where: { name },
    });
    if (!authors) {
      authors = this.noticeAuthorRepository.create({ name });
      await this.noticeAuthorRepository.save(authors);
    }

    return authors;
  }
}
