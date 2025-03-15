import { NODE_ENV } from "@/config/config.module";
import { Injectable } from "@nestjs/common";
import genericPool, { Pool } from "generic-pool";
import PQueue from "p-queue";
import puppeteer, { executablePath, Page } from "puppeteer";

@Injectable()
export class CrawlerService {
  private pagePool: Pool<Page>;
  private queue = new PQueue({ concurrency: 3 });
  private isInit: boolean = false;

  private async init() {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV !== NODE_ENV.LOCAL,
      executablePath: executablePath(),
      args: [
        // "--start-maximized",
        // "--no-sandbox",
      ],
    });
    const pagePool = genericPool.createPool(
      {
        create: async () => {
          return await browser.newPage();
        },
        destroy: async (page: Page) => {
          page.close();
        },
      },
      {
        max: 10,
        min: 5,
      },
    );
    this.pagePool = pagePool;
    this.isInit = true;
  }

  public async startCraw(fn: (page: Page) => Promise<void>) {
    if (!this.isInit) {
      await this.init();
    }

    this.queue.add(async () => {
      const page = await this.pagePool.acquire();
      await fn(page);
      await this.pagePool.release(page);
    });

    return;
  }

  public async findByCSSSelector(page: Page, selector: string, timeoutSec = 3) {
    let isExist = false;

    try {
      isExist = !!(await page.waitForSelector(selector, {
        timeout: timeoutSec * 1000,
      }));
    } catch {
      isExist = false;
    }

    if (!isExist) return [];

    return await page.$$(selector);
  }
}
