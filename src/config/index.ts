import { getExpressAppWithController } from "@/config/controller.config";
import { logger } from "@/config/logger.config";
import { swaggerSpec } from "@/config/swagger.config";
import type { Express } from "express";
import express, { NextFunction, Request, Response } from "express";

import * as swaggerUiExpress from "swagger-ui-express";

export const createExpress = () => {
  const app = getExpressAppWithController();
  setMiddleWare(app);
  setGlobalErrorHandler(app);
  return app;
};

const setMiddleWare = (app: Express) => {
  app.use(logger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));
};

const setGlobalErrorHandler = (app: Express) => {
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log(error);
    res.json({ message: error.message, error: error.name });
  });
};
