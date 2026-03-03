import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { EmailService } from './email.service';
import { SendQuoteEmailDto, TestEmailDto } from './dto/email.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-quote')
  async sendQuoteEmail(
    @Body() dto: SendQuoteEmailDto,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await this.emailService.sendQuoteEmail(dto, baseUrl);
    return ApiResponse.success(result.message);
  }

  @Post('test')
  async testEmail(@Body() dto: TestEmailDto) {
    const result = await this.emailService.sendTestEmail(dto);
    return ApiResponse.success(result.message);
  }
}
