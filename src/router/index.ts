import express, { NextFunction, Request, Response } from "express";

const indexRouter = express.Router();

indexRouter.get(
  "/",
  asyncHandler(async (_req, _res, _next) => {
    throw new Error("test");
  })
);

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default indexRouter;
