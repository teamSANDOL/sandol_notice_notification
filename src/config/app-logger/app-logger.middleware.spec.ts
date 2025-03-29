import { AppLoggerMiddleware } from "@/config/app-logger/app-logger.middleware";

describe("AppLoggerMiddleware", () => {
  it("should be defined", () => {
    expect(new AppLoggerMiddleware()).toBeDefined();
  });
});
