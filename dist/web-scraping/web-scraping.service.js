"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebScrapingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebScrapingService = void 0;
const common_1 = require("@nestjs/common");
const cheerio = require("cheerio");
const axios_1 = require("axios");
const https = require("https");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let WebScrapingService = WebScrapingService_1 = class WebScrapingService {
    configService;
    prisma;
    logger = new common_1.Logger(WebScrapingService_1.name);
    secretKey;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.secretKey = this.configService.get("SECRET_KEY");
    }
    axiosInstance = axios_1.default.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }),
    });
    lastFetchedRates = null;
    async handleCron() {
        this.logger.log("Running cron job to fetch BCV rates...");
        try {
            const rates = await this.getUrlBcv({ SecretKey: this.secretKey });
            if (rates) {
                this.lastFetchedRates = rates;
                this.logger.log("BCV rates fetched successfully by cron job.");
                this.logger.debug(rates);
            }
            else {
                this.logger.warn("Cron job failed to fetch BCV rates.");
            }
        }
        catch (error) {
            this.logger.error("Error in cron job fetching BCV rates:", error);
        }
    }
    async getUrlBcv(query) {
        if (this.secretKey !== query.SecretKey) {
            this.logger.error("No coincide la key, negando scraping a la web del bcv");
            throw new common_1.ForbiddenException("No coincide la key, negando scraping a la web del bcv");
        }
        const url = "https://www.bcv.org.ve/";
        try {
            const response = await this.axiosInstance.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            const rates = {
                dolar: null,
                euro: null,
                yuan: null,
                lira: null,
                rublo: null,
                fecha: new Date(),
            };
            const dateElement = $(".date-display-single");
            const dateContent = dateElement.attr("content");
            if (dateContent) {
                try {
                    rates.fecha = new Date(dateContent);
                }
                catch (error) {
                    this.logger.error("Error al parsear la fecha:", error);
                }
            }
            else {
                this.logger.warn("No se encontró el elemento de fecha o el atributo 'content'.");
            }
            const currencies = [
                "dolar",
                "euro",
                "yuan",
                "lira",
                "rublo",
            ];
            for (const currency of currencies) {
                const data = $(`#${currency} strong`).text();
                const rateFormatted = Number(data.replace(",", "."));
                if (isNaN(rateFormatted)) {
                    this.logger.warn(`No se pudo parsear el valor de ${currency}. Valor original:`, data);
                    rates[currency] = null;
                }
                else {
                    rates[currency] = rateFormatted;
                }
            }
            this.logger.debug(rates);
            if (rates.fecha) {
                try {
                    const existingRecord = await this.prisma.monedas.findUnique({
                        where: {
                            fecha: rates.fecha,
                        },
                    });
                    if (existingRecord) {
                        this.logger.log(`Ya existe un registro para la fecha ${rates.fecha.toISOString().split("T")[0]}. No se guardará.`);
                    }
                    else {
                        await this.prisma.monedas.create({
                            data: {
                                bcv_USD: rates.dolar !== null ? rates.dolar : 0,
                                bcv_EUR: rates.euro !== null ? rates.euro : 0,
                                bcv_CNY: rates.yuan !== null ? rates.yuan : 0,
                                bcv_TRY: rates.lira !== null ? rates.lira : 0,
                                bcv_RUB: rates.rublo !== null ? rates.rublo : 0,
                                fecha: rates.fecha,
                            },
                        });
                        this.logger.log(`Datos guardados para la fecha ${rates.fecha.toISOString().split("T")[0]}.`);
                    }
                }
                catch (dbError) {
                    this.logger.error("Error al guardar en la base de datos:", dbError);
                }
            }
            else {
                this.logger.warn("No se pudo obtener la fecha, no se guardará en la base de datos.");
            }
            return rates;
        }
        catch (error) {
            console.error("Error al realizar web scraping en BCV:", error);
            return null;
        }
    }
    async getRateByDate(dateString) {
        try {
            const date = new Date(dateString);
            date.setUTCHours(4, 0, 0, 0);
            const record = await this.prisma.monedas.findUnique({
                where: {
                    fecha: date,
                },
            });
            if (record) {
                return {
                    dolar: record.bcv_USD !== null ? record.bcv_USD.toNumber() : null,
                    euro: record.bcv_EUR !== null ? record.bcv_EUR.toNumber() : null,
                    yuan: record.bcv_CNY !== null ? record.bcv_CNY.toNumber() : null,
                    lira: record.bcv_TRY !== null ? record.bcv_TRY.toNumber() : null,
                    rublo: record.bcv_RUB !== null ? record.bcv_RUB.toNumber() : null,
                    fecha: record.fecha,
                };
            }
            else {
                this.logger.warn(`No BCV rate found for date: ${dateString}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error(`Error fetching rate by date ${dateString}:`, error);
            return null;
        }
    }
};
exports.WebScrapingService = WebScrapingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_4_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebScrapingService.prototype, "handleCron", null);
exports.WebScrapingService = WebScrapingService = WebScrapingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], WebScrapingService);
//# sourceMappingURL=web-scraping.service.js.map