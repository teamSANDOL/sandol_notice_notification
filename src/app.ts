import { createExpress } from "@/config";
import { CronService } from "@/service/cron.service";
import { EventService } from "@/service/event.service";
import { initDB } from "@/share/lib/typeorm/data-source";
import type { Express } from "express";

import "@/config/dotenv.config";
import "reflect-metadata";

const app: Express = createExpress();

const port = Number(process.env.APP_PORT) || 3000;

app.listen(port, async () => {
  await initDB();
  console.log(`server is running ${port}`);
  console.log(`now NODE_ENV is ${process.env.NODE_ENV}`);

  // TODO 모든 이벤트 리스너 구독 (아직 할게 없음)
  console.log("모든 이벤트 리스너 구독!");
  await EventService.subscribeAllListener();

  console.log("모든 Cron 작업 실행!");
  await CronService.allCronJobBy1Minute();
});
