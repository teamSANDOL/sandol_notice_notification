import { ApiModule } from "@/api/api.module";
import { AppLoggerMiddleware } from "@/config/app-logger/app-logger.middleware";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "./config/config.module";
import { CrawlerModule } from "./crawler/crawler.module";
import { DbModule } from "./db/db.module";

@Module({
  imports: [
    ConfigModule,
    CrawlerModule,
    DbModule,
    ScheduleModule.forRoot(),
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
