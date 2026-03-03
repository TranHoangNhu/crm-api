import { Controller, Get, Query } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('pdf-data')
export class PdfDataController {
  constructor(private pdfService: PdfService) {}

  @Get('quote')
  async getQuoteData(@Query('id') quoteId: string) {
    return this.pdfService.getQuoteData(quoteId);
  }

  @Get('contract')
  async getContractData(@Query('id') contractId: string) {
    return this.pdfService.getContractData(contractId);
  }

  @Get('handover')
  async getHandoverData(@Query('id') contractId: string) {
    return this.pdfService.getHandoverData(contractId);
  }
}
