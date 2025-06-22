import { NODE_ENV } from "@/config/config.module";
import { Injectable } from "@nestjs/common";
import PQueue from "p-queue";
import puppeteer, { Browser, executablePath, Page } from "puppeteer";

@Injectable()
export class CrawlerService {
  private _browser: Browser | null = null;
  private _browserQueue = new PQueue({ concurrency: 1 });
  private _pageQueue = new PQueue({ concurrency: 3 });

  public async startCraw(fn: (page: Page) => Promise<void>) {
    await this._pageQueue.add(async () => {
      const browser = await this._getBrowser();
      const page = await browser.newPage();
      await fn(page);
      await page.close();
    });

    // Queue의 Pending 작업이 끝났을때
    // 브라우저가 유휴 상태일때 브라우저를 닫음
    if (await this._isBrowserIdle()) {
      await this._closeBrowser();
    }
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

  private _getBrowser = async () => {
    return this._browserQueue.add(async () => {
      if (!this._browser) {
        this._browser = await puppeteer.launch({
          headless: process.env.NODE_ENV !== NODE_ENV.LOCAL,
          executablePath: executablePath(),
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-extensions",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-default-apps",
            "--memory-pressure-off",
            "--max_old_space_size=512",
            "--disable-background-networking",
            "--disable-background-downloads",
            "--disable-preconnect",
            "--disable-prefetch",
          ],
        });
      }

      return this._browser;
    });
  };

  private _closeBrowser = async () => {
    const browser = await this._getBrowser();
    await browser.close();
    this._browser = null;
  };

  private _isBrowserIdle = async () => {
    const browser = await this._getBrowser();
    const pageLength = (await browser.pages()).length;
    const pageQueue = this._pageQueue;
    return pageLength === 1 && pageQueue.size === 0 && pageQueue.pending === 0;
  };
}
