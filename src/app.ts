import { dataSource } from "@/connect/data-source";
import indexRouter from "@/router";
import { NODE_ENV } from "@/share/const/node-env";
import dotenv from "dotenv";
import express from "express";
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

dataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

const port = Number(process.env.APP_PORT) || 3000;

app.listen(port, () => {
  console.log(`server is running ${port}`);
  console.log(`now NODE_ENV is ${process.env.NODE_ENV}`);
});
