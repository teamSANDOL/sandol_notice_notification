import { NODE_ENV } from "@/config/config.module";
import { Injectable } from "@nestjs/common";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import PQueue from "p-queue";
import puppeteer, { Browser, executablePath, Page } from "puppeteer";

@Injectable()
export class CrawlerService {
  private _browser: Browser | null = null;
  private _userDataDir: string | null = null;
  private _browserQueue = new PQueue({ concurrency: 1 });
  private _pageQueue = new PQueue({ concurrency: 3 });

  // fn 실패(goto timeout 등)는 warn 로그만 남기고 null을 반환한다. 예외를 전파하지 않는다.
  public async startCraw<T>(fn: (page: Page) => Promise<T>): Promise<T | null> {
    try {
      return await this._pageQueue.add(async () => {
        const page = await (await this._getBrowser()).newPage();
        try {
          return await fn(page);
        } finally {
          await page.close().catch(() => undefined);
        }
      });
    } catch (err) {
      console.warn("크롤링 실패:", err instanceof Error ? err.message : err);
      return null;
    } finally {
      // Queue의 Pending 작업이 끝났을때 브라우저가 유휴 상태이면 닫음
      if (await this._isBrowserIdle().catch(() => true)) {
        await this._closeBrowser();
      }
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
        // 실행마다 프로필 디렉터리를 직접 만들어 종료 시 반드시 삭제한다.
        this._userDataDir = await mkdtemp(
          join(tmpdir(), "puppeteer_dev_chrome_profile-"),
        );
        try {
          this._browser = await puppeteer.launch({
            userDataDir: this._userDataDir,
            // chromium 임시 파일(org.chromium.*)도 프로필 폴더 안에 만들어 함께 삭제한다.
            env: { ...process.env, TMPDIR: this._userDataDir },
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
        } catch (err) {
          await this._removeUserDataDir();
          throw err;
        }
      }

      return this._browser;
    });
  };

  private _closeBrowser = async () => {
    const browser = this._browser;
    this._browser = null;
    try {
      await browser?.close();
    } catch (err) {
      console.warn("브라우저 종료 실패:", err);
      browser?.process()?.kill("SIGKILL");
    } finally {
      await this._removeUserDataDir();
    }
  };

  private _removeUserDataDir = async () => {
    const dir = this._userDataDir;
    this._userDataDir = null;
    if (dir) await rm(dir, { recursive: true, force: true });
  };

  // 브라우저가 없으면 유휴(true)로 보되 새로 띄우지 않는다.
  private _isBrowserIdle = async () => {
    const pageQueue = this._pageQueue;
    if (pageQueue.size !== 0 || pageQueue.pending !== 0) return false;
    if (!this._browser) return false;
    return (await this._browser.pages()).length <= 1;
  };
}
