import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, UpdateQuoteStatusDto } from './dto/quote.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quotesService.updateStatus(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.quotesService.deleteQuote(id);
  }
}
