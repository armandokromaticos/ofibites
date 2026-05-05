import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("api");
  app.enableCors(
    process.env.NODE_ENV === "production"
      ? { origin: process.env.CORS_ORIGIN, credentials: true }
      : undefined,
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Ofibites API")
    .setDescription("API B2B de aprovisionamiento corporativo")
    .setVersion("1.0")
    .addTag("Auth", "Autenticación")
    .addTag("Users", "Gestión de usuarios")
    .addTag("Products", "Gestión de productos, tamaños y modificadores")
    .addTag("Combos", "Gestión de combos")
    .addTag("Orders", "Gestión de órdenes")
    .addTag("Banners", "Gestión de banners para carrusel")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
