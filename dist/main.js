"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    if (process.env.NODE_ENV !== "production") {
        const config = new swagger_1.DocumentBuilder()
            .setTitle("Mi API de NestJS con Prisma")
            .setDescription("Documentación interactiva de la API para pruebas y desarrollo.")
            .setVersion("1.0")
            .addTag("auth", "Operaciones de Autenticación")
            .addTag("profile", "Operaciones de Perfil de Usuario")
            .addTag("web-scraping", "Operaciones de Web Scraping y Tasas BCV")
            .addBearerAuth({
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "JWT",
            description: "Introduce el token JWT",
            in: "header",
        }, "JWT-auth")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup("api-docs", app, document, {
            swaggerOptions: {
                docExpansion: "none",
            },
        });
    }
    await app.listen(process.env.PORT ?? 3000);
    const url = await app.getUrl();
    app.get(nestjs_pino_1.Logger).log(`Application is running on: ${url}`);
    if (process.env.NODE_ENV !== "production") {
        app
            .get(nestjs_pino_1.Logger)
            .log(`Swagger UI available at: ${await app.getUrl()}/api-docs`);
    }
}
void bootstrap();
//# sourceMappingURL=main.js.map