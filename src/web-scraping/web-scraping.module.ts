import { Module } from "@nestjs/common";
import { WebScrapingService } from "./web-scraping.service";
import { WebScrapingController } from "./web-scraping.controller";

@Module({
  controllers: [WebScrapingController],
  providers: [WebScrapingService],
})
export class WebScrapingModule {}
