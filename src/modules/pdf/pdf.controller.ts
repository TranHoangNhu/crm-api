import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @Get('quote')
  async getQuotePdf(
    @Query('id') quoteId: string,
    @Res() res: Response,
  ) {
    const html = await this.pdfService.generateQuotePdf(quoteId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('contract')
  async getContractPdf(
    @Query('id') contractId: string,
    @Res() res: Response,
  ) {
    const html = await this.pdfService.generateContractPdf(contractId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('handover')
  async getHandoverPdf(
    @Query('id') contractId: string,
    @Res() res: Response,
  ) {
    const html = await this.pdfService.generateHandoverPdf(contractId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
