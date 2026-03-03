import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './common/supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core modules
    SupabaseModule,
    AuthModule,

    // Feature modules
    EmailModule,
    PdfModule,
    DeliveryModule,
    QuotesModule,
    ContractsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
