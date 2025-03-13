import { NoticeController } from "@/controller/notice/notice.controller";
import type { Express } from "express";
import { createExpressServer } from "routing-controllers";
export const routingControllersOptions = {
  controllers: [NoticeController],
  routePrefix: "/api",
};

export const getExpressAppWithController = (): Express => {
  return createExpressServer(routingControllersOptions);
};
