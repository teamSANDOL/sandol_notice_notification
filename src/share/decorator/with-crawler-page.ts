/* eslint-disable @typescript-eslint/no-explicit-any */

import { CrawlerService } from "@/service/crawler.service";
import PQueue from "p-queue";
import { Page } from "puppeteer";

const queue = new PQueue({ concurrency: 3 });

export function withCrawlerPageClose<T extends { page?: Page }>() {
  return (_target: T, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return new Promise<void>((resolve, _reject) => {
        queue.add(async () => {
          const crawlerService = await CrawlerService.get();
          const page = await crawlerService.start();
          (this as T).page = page;
          try {
            // 원래의 메서드를 실행하고 결과를 기다림
            const result = await originalMethod.apply(this, args);
            return resolve(result);
          } finally {
            // 작업이 끝난 후 반드시 페이지를 release
            await crawlerService.release(page);
          }
        });
      });
    };
  };
}
