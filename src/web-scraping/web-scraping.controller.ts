import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WebScrapingService } from "./web-scraping.service"; // Import BcvRates
import { SecretKeyWebScraping } from "./dto/create-web-scraping.dto";
import { GetRateByDateDto } from "./dto/get-rate-by-date.dto";

@ApiTags("web-scraping")
@Controller("web-scraping")
export class WebScrapingController {
  constructor(private readonly webScrapingService: WebScrapingService) {}

  @Get()
  @ApiOperation({ summary: "Get BCV rates with a secret key" })
  @ApiResponse({
    status: 200,
    description: "Returns BCV rates data.",
  })
  findAll(@Query() query: SecretKeyWebScraping) {
    // Explicit return type
    const data = this.webScrapingService.getUrlBcv(query);

    return data;
  }

  @Get("rate-by-date")
  @ApiOperation({ summary: "Get BCV rate for a specific date" })
  @ApiResponse({
    status: 200,
    description: "Returns BCV rate for the specified date.",
  })
  @ApiQuery({
    name: "date",
    required: true,
    description: "Date in YYYY-MM-DD format (e.g., 2025-07-09)",
    type: String,
    example: "2025-07-09",
  })
  async getRateByDate(@Query() query: GetRateByDateDto) {
    const data = await this.webScrapingService.getRateByDate(query.date);
    return data;
  }
}
