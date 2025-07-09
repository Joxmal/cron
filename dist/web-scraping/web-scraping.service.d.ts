import { SecretKeyWebScraping } from "./dto/create-web-scraping.dto";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
export interface BcvRates {
    dolar: number | null;
    euro: number | null;
    yuan: number | null;
    lira: number | null;
    rublo: number | null;
    fecha: Date;
}
export declare class WebScrapingService {
    private readonly configService;
    private prisma;
    private readonly logger;
    private readonly secretKey;
    constructor(configService: ConfigService, prisma: PrismaService);
    private readonly axiosInstance;
    private lastFetchedRates;
    handleCron(): Promise<void>;
    getUrlBcv(query: SecretKeyWebScraping): Promise<BcvRates | null>;
    getRateByDate(dateString: string): Promise<BcvRates | null>;
}
