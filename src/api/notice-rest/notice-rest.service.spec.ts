import { Test, TestingModule } from "@nestjs/testing";
import { NoticeRestService } from "./notice-rest.service";

describe("NoticeRestService", () => {
  let service: NoticeRestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeRestService],
    }).compile();

    service = module.get<NoticeRestService>(NoticeRestService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
