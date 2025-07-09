import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { join } from "path";
import { ScheduleModule } from "@nestjs/schedule";
import { WebScrapingModule } from "./web-scraping/web-scraping.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigService esté disponible en toda la app
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: Joi.number().default(3000),
        SECRET_KEY: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level:
            configService.get<string>("NODE_ENV") === "production"
              ? "info"
              : "debug",

          redact: {
            paths: ["req.headers.authorization", "req.headers.cookie"],
            censor: "*** [REDACTED] ***", // El texto que lo reemplazará
          },

          transport:
            configService.get<string>("NODE_ENV") !== "production"
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true, // Colorea la salida
                    translateTime: "SYS:standard", // Muestra la hora en formato legible
                    singleLine: true, // Muestra cada log en una sola línea (opcional)
                    ignore: "pid,hostname,res,req.headers", // Oculta campos menos útiles para desarrollo
                  },
                }
              : {
                  targets: [
                    // --- Target 1: Archivo para logs generales (info, warn, error) ---
                    {
                      level: "info", // Nivel mínimo para este archivo
                      target: "pino-roll",
                      options: {
                        file: join(process.cwd(), "logs", "app.log"),
                        frequency: "daily", // CORREGIDO: Usar 'daily'
                        size: "20M",
                        limit: {
                          count: 30,
                        }, // Reducido para no guardar 100 archivos
                        dateFormat: "yyyy-MM-dd", // CORREGIDO: formato de fecha
                      },
                    },
                    // --- Target 2: Archivo exclusivo para errores ---
                    {
                      level: "error", // Solo logs de nivel 'error' y superiores
                      target: "pino-roll",
                      options: {
                        // Nombre de archivo diferente para los errores
                        file: join(process.cwd(), "logs", "error.log"),
                        frequency: "daily",
                        size: "10M", // Puede que los errores ocupen menos
                        limit: {
                          count: 30,
                        }, // Quizás quieras retener errores por más tiempo
                        dateFormat: "yyyy-MM-dd",
                      },
                    },
                  ],
                },
        },
      }),
    }),
    ThrottlerModule.forRoot([
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
    WebScrapingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
