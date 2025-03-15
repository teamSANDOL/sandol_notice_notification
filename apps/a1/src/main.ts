import { NestFactory } from '@nestjs/core';
import { A1Module } from './a1.module';

async function bootstrap() {
  const app = await NestFactory.create(A1Module);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
