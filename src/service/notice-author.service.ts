import { dataSource } from "@/connect/data-source";
import { NoticeAuthors } from "@/entity/notice-authors.entity";
import { Repository } from "typeorm";

export class NoticeAuthorService {
  // eslint-disable-next-line no-unused-vars
  constructor(private noticeAuthorRepository: Repository<NoticeAuthors>) {}

  public static async get() {
    const repository = dataSource.getRepository(NoticeAuthors);
    return new NoticeAuthorService(repository);
  }

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
