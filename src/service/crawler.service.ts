import { NODE_ENV } from "@/share/const/node-env";
import genericPool, { Pool } from "generic-pool";
import puppeteer, { executablePath, Page } from "puppeteer";

export class CrawlerService {
  private static instance: CrawlerService | null;
  // eslint-disable-next-line no-unused-vars
  constructor(private pagePool: Pool<Page>) {}

  // singleton
  public static async get(headless = process.env.NODE_ENV !== NODE_ENV.LOCAL) {
    if (this.instance) return this.instance;

    const browser = await puppeteer.launch({
      headless,
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
      }
    );
    this.instance = new CrawlerService(pagePool);

    return this.instance;
  }

  public start() {
    return this.pagePool.acquire();
  }

  public release(page: Page) {
    return this.pagePool.release(page);
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
