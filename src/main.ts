import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { createLogger, format } from "winston";
import { AppModule } from "./app.module";
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  // defaultMeta: { service: "your-service-name" },
  // transports: [
  //   //
  //   // - Write to all logs with level `info` and below to `quick-start-combined.log`.
  //   // - Write all logs error (and below) to `quick-start-error.log`.
  //   //
  //   new transports.File({ filename: "quick-start-error.log", level: "error" }),
  //   new transports.File({ filename: "quick-start-combined.log" }),
  // ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("한국공학대학교 공지사항 크롤링 서버")
    .setDescription("API description")
    .setVersion("1.0")
    // .addTag("")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("doc", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
