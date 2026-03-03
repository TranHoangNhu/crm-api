import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  // Global prefix: /api/v1
  app.setGlobalPrefix('api/v1');

  // CORS
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  return app;
}
