import { NoticeController } from "@/controller/notice/notice.controller";
import type { Express } from "express";
import {
  createExpressServer,
  RoutingControllersOptions,
} from "routing-controllers";

export const routingControllersOptions: RoutingControllersOptions = {
  controllers: [NoticeController],
  routePrefix: "/api",
};

export const getExpressAppWithController = (): Express => {
  return createExpressServer(routingControllersOptions);
};
