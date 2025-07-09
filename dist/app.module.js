"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Joi = require("joi");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const path_1 = require("path");
const schedule_1 = require("@nestjs/schedule");
const web_scraping_module_1 = require("./web-scraping/web-scraping.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    DATABASE_URL: Joi.string().required(),
                    NODE_ENV: Joi.string()
                        .valid("development", "production", "test")
                        .default("development"),
                    PORT: Joi.number().default(3000),
                    SECRET_KEY: Joi.string().required(),
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            nestjs_pino_1.LoggerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    pinoHttp: {
                        level: configService.get("NODE_ENV") === "production"
                            ? "info"
                            : "debug",
                        redact: {
                            paths: ["req.headers.authorization", "req.headers.cookie"],
                            censor: "*** [REDACTED] ***",
                        },
                        transport: configService.get("NODE_ENV") !== "production"
                            ? {
                                target: "pino-pretty",
                                options: {
                                    colorize: true,
                                    translateTime: "SYS:standard",
                                    singleLine: true,
                                    ignore: "pid,hostname,res,req.headers",
                                },
                            }
                            : {
                                targets: [
                                    {
                                        level: "info",
                                        target: "pino-roll",
                                        options: {
                                            file: (0, path_1.join)(process.cwd(), "logs", "app.log"),
                                            frequency: "daily",
                                            size: "20M",
                                            limit: {
                                                count: 30,
                                            },
                                            dateFormat: "yyyy-MM-dd",
                                        },
                                    },
                                    {
                                        level: "error",
                                        target: "pino-roll",
                                        options: {
                                            file: (0, path_1.join)(process.cwd(), "logs", "error.log"),
                                            frequency: "daily",
                                            size: "10M",
                                            limit: {
                                                count: 30,
                                            },
                                            dateFormat: "yyyy-MM-dd",
                                        },
                                    },
                                ],
                            },
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: "short",
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: "default",
                    ttl: 10000,
                    limit: 25,
                },
                {
                    name: "long",
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            web_scraping_module_1.WebScrapingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map