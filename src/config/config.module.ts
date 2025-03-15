import { AppLoggerMiddleware } from "@/config/app-logger/app-logger.middleware";
import { Module } from "@nestjs/common";
import { ConfigModule as OriginConfigModule } from "@nestjs/config";

export const isProduction = process.env.NODE_ENV === "production";
const envPath = !isProduction ? ".env.dev" : ".env";
export enum NODE_ENV {
  LOCAL = "local",
  DEV = "development",
  PROD = "production",
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
