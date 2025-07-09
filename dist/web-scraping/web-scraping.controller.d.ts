import { WebScrapingService } from "./web-scraping.service";
import { SecretKeyWebScraping } from "./dto/create-web-scraping.dto";
import { GetRateByDateDto } from "./dto/get-rate-by-date.dto";
export declare class WebScrapingController {
    private readonly webScrapingService;
    constructor(webScrapingService: WebScrapingService);
    findAll(query: SecretKeyWebScraping): Promise<import("./web-scraping.service").BcvRates | null>;
    getRateByDate(query: GetRateByDateDto): Promise<import("./web-scraping.service").BcvRates | null>;
}
