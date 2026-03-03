import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupApp } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Áp dụng chung logic setup (CORS, Pipes, Prefix)
  setupApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3002);

  await app.listen(port);
  console.log(`🚀 CRM API running at http://localhost:${port}/api/v1`);
}

bootstrap();
