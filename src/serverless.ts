import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    // Áp dụng chung logic setup
    setupApp(app);

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

// Vercel Serverless Function entry point
export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
