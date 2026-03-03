import { Module } from '@nestjs/common';
import { PdfDataController } from './pdf-data.controller';
import { PdfService } from './pdf.service';

@Module({
  controllers: [PdfDataController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
