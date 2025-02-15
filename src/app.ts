import { dataSource } from "@/connect/data-source";
import indexRouter from "@/router";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config();

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

app.listen(3000, () => {
  console.log("server is running 3000");
  console.log(`now NODE_ENV is ${process.env.NODE_ENV}`);
});
