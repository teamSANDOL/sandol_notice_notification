import { Module } from "@nestjs/common";
import { CrawlerModule } from "@/crawler/crawler.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [CrawlerModule],
  controllers: [HealthController],
})
export class HealthModule {}
