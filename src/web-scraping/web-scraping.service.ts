import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { SecretKeyWebScraping } from "./dto/create-web-scraping.dto";
import * as cheerio from "cheerio";
import axios from "axios"; // Import axios
import * as https from "https"; // Import https for Agent
import { Cron, CronExpression } from "@nestjs/schedule"; // Import Cron and CronExpression
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

export interface BcvRates {
  // Export the interface
  dolar: number | null;
  euro: number | null;
  yuan: number | null;
  lira: number | null;
  rublo: number | null;
  fecha: Date;
}

type CurrencyKey = "dolar" | "euro" | "yuan" | "lira" | "rublo";

@Injectable()
export class WebScrapingService {
  private readonly logger = new Logger(WebScrapingService.name);
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secretKey = this.configService.get<string>("SECRET_KEY")!;
  }

  // Create an Axios instance with SSL verification disabled
  private readonly axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  // Store the last fetched rates
  private lastFetchedRates: BcvRates | null = null;

  // Cron job to fetch rates every 4 hours
  @Cron(CronExpression.EVERY_4_HOURS)
  async handleCron() {
    this.logger.log("Running cron job to fetch BCV rates...");
    try {
      // Call the existing getUrlBcv method to fetch rates
      const rates = await this.getUrlBcv({ SecretKey: this.secretKey }); // Pass a dummy SecretKey for cron
      if (rates) {
        this.lastFetchedRates = rates;
        this.logger.log("BCV rates fetched successfully by cron job.");
        this.logger.debug(rates);
      } else {
        this.logger.warn("Cron job failed to fetch BCV rates.");
      }
    } catch (error) {
      this.logger.error("Error in cron job fetching BCV rates:", error);
    }
  }

  async getUrlBcv(query: SecretKeyWebScraping): Promise<BcvRates | null> {
    if (this.secretKey !== query.SecretKey) {
      this.logger.error(
        "No coincide la key, negando scraping a la web del bcv",
      );
      throw new ForbiddenException(
        "No coincide la key, negando scraping a la web del bcv",
      );
    }

    // Changed return type
    const url = "https://www.bcv.org.ve/";
    try {
      const response = await this.axiosInstance.get(url); // Use axios.get
      const html = response.data as string; // Explicitly cast to string
      const $ = cheerio.load(html);

      const rates: BcvRates = {
        dolar: null,
        euro: null,
        yuan: null,
        lira: null,
        rublo: null,
        fecha: new Date(), // Se actualizará con la fecha extraída
      };

      const dateElement = $(".date-display-single");
      const dateContent = dateElement.attr("content");

      if (dateContent) {
        try {
          // Parsear la fecha del atributo 'content'
          rates.fecha = new Date(dateContent);
        } catch (error) {
          this.logger.error("Error al parsear la fecha:", error);
        }
      } else {
        this.logger.warn(
          "No se encontró el elemento de fecha o el atributo 'content'.",
        );
      }

      const currencies: CurrencyKey[] = [
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
          this.logger.warn(
            `No se pudo parsear el valor de ${currency}. Valor original:`,
            data,
          );
          rates[currency] = null; // Assign null if parsing fails
        } else {
          rates[currency] = rateFormatted;
        }
      }

      this.logger.debug(rates); // Log all rates

      // Lógica para guardar en la base de datos
      if (rates.fecha) {
        try {
          // Verificar si ya existe un registro para esta fecha
          const existingRecord = await this.prisma.monedas.findUnique({
            where: {
              fecha: rates.fecha,
            },
          });

          if (existingRecord) {
            this.logger.log(
              `Ya existe un registro para la fecha ${rates.fecha.toISOString().split("T")[0]}. No se guardará.`,
            );
          } else {
            // Guardar los datos en la base de datos
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
            this.logger.log(
              `Datos guardados para la fecha ${rates.fecha.toISOString().split("T")[0]}.`,
            );
          }
        } catch (dbError) {
          this.logger.error("Error al guardar en la base de datos:", dbError);
        }
      } else {
        this.logger.warn(
          "No se pudo obtener la fecha, no se guardará en la base de datos.",
        );
      }

      return rates;
    } catch (error) {
      console.error("Error al realizar web scraping en BCV:", error);
      // Considerar si la SecretKey podría usarse para algo aquí, por ejemplo, logging.
      return null;
    }
  }

  async getRateByDate(dateString: string): Promise<BcvRates | null> {
    try {
      const date = new Date(dateString);

      date.setUTCHours(4, 0, 0, 0); // Normalize to start of the day in UTC

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
      } else {
        this.logger.warn(`No BCV rate found for date: ${dateString}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error fetching rate by date ${dateString}:`, error);
      return null;
    }
  }
}
