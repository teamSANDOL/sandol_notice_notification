import { Test, TestingModule } from "@nestjs/testing";
import { NoticeAuthorService } from "./notice-author.service";

describe("NoticeAuthorService", () => {
  let service: NoticeAuthorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeAuthorService],
    }).compile();

    service = module.get<NoticeAuthorService>(NoticeAuthorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
