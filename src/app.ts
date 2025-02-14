import indexRouter from "@/router";
import express from "express";
import morgan from "morgan";

const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

app.listen(3000, () => {
  console.log("server is running 3000");
});
