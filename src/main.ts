import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.enableCors({
  //   origin: (origin, callback) => {
  //     // permite chamadas sem origin (Postman/curl)
  //     if (!origin) return callback(null, true);

  //     if (allowedOrigins.includes(origin)) {
  //       return callback(null, true);
  //     }

  //     return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  //   },
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  //   maxAge: 3600,
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
