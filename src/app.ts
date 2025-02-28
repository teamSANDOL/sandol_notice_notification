import indexRouter from "@/router";
import { CronService } from "@/service/cron.service";
import { EventService } from "@/service/event.service";
import { NODE_ENV } from "@/share/const/node-env";
import { initDB } from "@/share/lib/typeorm/data-source";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
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

  // TODO 모든 이벤트 리스너 구독 (아직 할게 없음)
  console.log("모든 이벤트 리스너 구독!");
  await EventService.subscribeAllListener();

  console.log("모든 Cron 작업 실행!");
  CronService.allCronJobBy2Minute();
});

// global error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(error);
  res.json({ message: error.message, error: error.name });
});
