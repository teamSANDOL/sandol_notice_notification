import express from "express";

const indexRouter = express.Router();

indexRouter.get("/", (req, res, _next) => {
  res.json({ message: "hello" });
});

export default indexRouter;
