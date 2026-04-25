import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

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

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const isDevelopment = process.env.NODE_ENV === 'development';

  logger.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);
  logger.log(`Allowed origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      // permite chamadas sem origin (Postman/curl)
      if (!origin) {
        if (isDevelopment) {
          logger.debug('CORS: Request without origin (allowed in dev)');
          return callback(null, true);
        } else {
          logger.warn('CORS: Request without origin blocked in production');
          return callback(null, false);
        }
      }

      if (allowedOrigins.includes(origin)) {
        logger.debug(`CORS: Allowed origin: ${origin}`);
        return callback(null, true);
      }

      // Bloqueia origin não autorizado
      logger.warn(`CORS: Blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    maxAge: 3600,
    exposedHeaders: ['X-CSRF-Token'],
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
