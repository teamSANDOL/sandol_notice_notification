import indexRouter from "@/router";
import { EventService } from "@/service/event.service";
import { NoticeService } from "@/service/notice.service";
import { NODE_ENV } from "@/share/const/node-env";
import { initDB } from "@/share/lib/typeorm/data-source";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cron from "node-cron";
import path from "path";

const envPath = process.env.NODE_ENV === NODE_ENV.PROD ? ".env" : ".env.dev";

dotenv.config({
  debug: true,
  path: path.resolve(process.cwd(), envPath),
});

const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

const port = Number(process.env.APP_PORT) || 3000;

app.listen(port, async () => {
  await initDB();
  console.log(`server is running ${port}`);
  console.log(`now NODE_ENV is ${process.env.NODE_ENV}`);

  // 모든 리스너 구독
  await (await EventService.get()).subscribeAllListener();
  console.log("모든 이벤트 리스너 구독!");

  // 10초마다 실행
  cron.schedule("*/10 * * * * *", repeatTaskBy10Minute);
  repeatTaskBy10Minute();
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(error);
  res.json({ message: error.message, error: error.name });
});

// 10초마다 실행되는 task
async function repeatTaskBy10Minute() {
  try {
    const noticeService = await NoticeService.get();
    await noticeService.cronJob();
  } catch (err) {
    console.error("NOTICE SERVICE ERROR!", err);
  }
}
