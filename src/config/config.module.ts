import { AppLoggerMiddleware } from "@/config/app-logger/app-logger.middleware";
import { Module } from "@nestjs/common";
import { ConfigModule as OriginConfigModule } from "@nestjs/config";

export enum NODE_ENV {
  LOCAL = "local",
  DEV = "development",
  PROD = "production",
}
export const isProduction = process.env.NODE_ENV === "production";

const envPath = {
  [NODE_ENV.LOCAL]: ".env.local",
  [NODE_ENV.DEV]: ".env.dev",
  [NODE_ENV.PROD]: ".env",
}[process.env.NODE_ENV ?? NODE_ENV.LOCAL];

if (!envPath) {
  throw new Error("NODE_ENV is not set");
}

@Module({
  imports: [
    OriginConfigModule.forRoot({
      envFilePath: [envPath],
    }),
  ],
  providers: [AppLoggerMiddleware],
})
export class ConfigModule {}
