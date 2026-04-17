import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // Serve static files from the "uploads" directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Delete attributes not in the DTO
      forbidNonWhitelisted: true, // Error if non-whitelisted field sent
      transform: true, // Automatically converts types (e.g., string → number)
      transformOptions: {
        enableImplicitConversion: true, // Convert primitive types automatically
      },
    }),
  );

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true, // Allow cookies
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
