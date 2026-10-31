import { Test, TestingModule } from "@nestjs/testing";
import { access } from "node:fs/promises";
import puppeteer, { Browser, Page } from "puppeteer";
import { CrawlerService } from "./crawler.service";

describe("CrawlerService", () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  afterEach(() => jest.restoreAllMocks());

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("goto가 reject해도 예외를 전파하지 않고 브라우저를 닫고 프로필을 지운다", async () => {
    const page = {
      close: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockRejectedValue(new Error("Navigation timeout")),
    };
    const browser = {
      newPage: jest.fn().mockResolvedValue(page),
      pages: jest.fn().mockResolvedValue([{}]),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const launch = jest
      .spyOn(puppeteer, "launch")
      .mockResolvedValue(browser as unknown as Browser);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await service.startCraw((p: Page) => p.goto("http://x"));

    expect(result).toBeNull();
    expect(page.close).toHaveBeenCalled();
    expect(browser.close).toHaveBeenCalledTimes(1);
    const { userDataDir, env } = launch.mock.calls[0][0] as {
      userDataDir: string;
      env: Record<string, string>;
    };
    expect(env.TMPDIR).toBe(userDataDir);
    await expect(access(userDataDir)).rejects.toThrow();
  });
});
