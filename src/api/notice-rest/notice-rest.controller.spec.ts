import { Test, TestingModule } from "@nestjs/testing";
import { NoticeRestController } from "./notice-rest.controller";

describe("NoticeRestController", () => {
  let controller: NoticeRestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeRestController],
    }).compile();

    controller = module.get<NoticeRestController>(NoticeRestController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
