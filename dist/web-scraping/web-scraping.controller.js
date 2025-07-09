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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebScrapingController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const web_scraping_service_1 = require("./web-scraping.service");
const create_web_scraping_dto_1 = require("./dto/create-web-scraping.dto");
const get_rate_by_date_dto_1 = require("./dto/get-rate-by-date.dto");
let WebScrapingController = class WebScrapingController {
    webScrapingService;
    constructor(webScrapingService) {
        this.webScrapingService = webScrapingService;
    }
    findAll(query) {
        const data = this.webScrapingService.getUrlBcv(query);
        return data;
    }
    async getRateByDate(query) {
        const data = await this.webScrapingService.getRateByDate(query.date);
        return data;
    }
};
exports.WebScrapingController = WebScrapingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get BCV rates with a secret key" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns BCV rates data.",
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_web_scraping_dto_1.SecretKeyWebScraping]),
    __metadata("design:returntype", void 0)
], WebScrapingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("rate-by-date"),
    (0, swagger_1.ApiOperation)({ summary: "Get BCV rate for a specific date" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns BCV rate for the specified date.",
    }),
    (0, swagger_1.ApiQuery)({
        name: "date",
        required: true,
        description: "Date in YYYY-MM-DD format (e.g., 2025-07-09)",
        type: String,
        example: "2025-07-09",
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_rate_by_date_dto_1.GetRateByDateDto]),
    __metadata("design:returntype", Promise)
], WebScrapingController.prototype, "getRateByDate", null);
exports.WebScrapingController = WebScrapingController = __decorate([
    (0, swagger_1.ApiTags)("web-scraping"),
    (0, common_1.Controller)("web-scraping"),
    __metadata("design:paramtypes", [web_scraping_service_1.WebScrapingService])
], WebScrapingController);
//# sourceMappingURL=web-scraping.controller.js.map