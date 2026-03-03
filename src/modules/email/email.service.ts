import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SendQuoteEmailDto, TestEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(private supabaseService: SupabaseService) {}

  async sendQuoteEmail(dto: SendQuoteEmailDto, baseUrl: string) {
    const supabase = this.supabaseService.getAdminClient();

    // 1. Fetch quote with customer
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*, customer:customers(*)')
      .eq('id', dto.quote_id)
      .single();

    if (quoteError || !quote) {
      throw new NotFoundException('Không tìm thấy báo giá');
    }

    const customer = quote.customer as any;
    const toEmail = customer?.email;
    const customerName = customer?.name || 'Khách hàng';

    if (!toEmail) {
      throw new BadRequestException('Khách hàng chưa có địa chỉ email');
    }

    // 2. Get default email settings
    const { data: emailSet, error: emailErr } = await supabase
      .from('email_settings')
      .select('*')
      .eq('is_default', true)
      .single();

    if (emailErr || !emailSet) {
      throw new BadRequestException(
        'Chưa cấu hình tài khoản gửi Email (SMTP) mặc định',
      );
    }

    // 3. Create transporter
    const transporter = nodemailer.createTransport({
      host: emailSet.smtp_host,
      port: emailSet.smtp_port || 465,
      secure: emailSet.use_ssl !== false,
      auth: {
        user: emailSet.smtp_user,
        pass: emailSet.smtp_password,
      },
    });

    // 4. Ensure share token
    let shareToken = quote.share_token;
    if (!shareToken) {
      shareToken = Math.random().toString(36).substring(2, 15);
      await supabase
        .from('quotes')
        .update({ share_token: shareToken })
        .eq('id', quote.id);
    }

    const quoteUrl = `${baseUrl}/quote/${shareToken}`;

    // 5. Send email
    await transporter.sendMail({
      from: `"${emailSet.from_name || 'CRM Báo Giá'}" <${emailSet.from_email || emailSet.smtp_user}>`,
      to: toEmail,
      subject: `Báo giá mới: ${quote.title} - CRM Báo Giá`,
      html: this.buildQuoteEmailHtml(customerName, quote.title, quoteUrl),
    });

    return { message: 'Email đã gửi thành công tới khách hàng!' };
  }

  async sendTestEmail(dto: TestEmailDto) {
    const transporter = nodemailer.createTransport({
      host: dto.smtp_host,
      port: dto.smtp_port || 465,
      secure: dto.use_ssl !== false,
      auth: {
        user: dto.smtp_user,
        pass: dto.smtp_password,
      },
    });

    await transporter.sendMail({
      from: `"${dto.from_name || 'CRM Báo Giá'}" <${dto.from_email || dto.smtp_user}>`,
      to: dto.to_email,
      subject: '🧪 Test Email - CRM Báo Giá',
      html: this.buildTestEmailHtml(dto),
    });

    return { message: 'Email đã gửi thành công!' };
  }

  private buildQuoteEmailHtml(
    customerName: string,
    quoteTitle: string,
    quoteUrl: string,
  ): string {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%); border-radius: 12px; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 10px;">Báo Giá Mới</h1>
          <p style="margin: 0; opacity: 0.9;">Kính gửi ${customerName}</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-top: 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Chúng tôi vừa tạo một báo giá mới cho dự án <strong>${quoteTitle}</strong> của bạn.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${quoteUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Xem Chi Tiết Báo Giá
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Nếu nút bấm không hoạt động, vui lòng copy đường dẫn sau vào trình duyệt:<br>
            <a href="${quoteUrl}" style="color: #0d6efd;">${quoteUrl}</a>
          </p>
        </div>
        <p style="text-align: center; color: #999; margin-top: 20px; font-size: 13px;">
          Email này được gửi tự động từ hệ thống CRM Báo Giá.
        </p>
      </div>
    `;
  }

  private buildTestEmailHtml(dto: TestEmailDto): string {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 10px;">✅ Test Email Thành Công!</h1>
          <p style="margin: 0; opacity: 0.9;">Hệ thống CRM Báo Giá đã gửi email thành công</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-top: 20px;">
          <h3 style="margin: 0 0 16px; color: #333;">📧 Thông tin cấu hình</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">SMTP Host:</td><td style="padding: 8px 0; font-weight: bold;">${dto.smtp_host}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Port:</td><td style="padding: 8px 0; font-weight: bold;">${dto.smtp_port}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Bảo mật:</td><td style="padding: 8px 0; font-weight: bold;">${dto.use_ssl !== false ? 'SSL' : 'STARTTLS'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">From:</td><td style="padding: 8px 0; font-weight: bold;">${dto.from_name} &lt;${dto.from_email}&gt;</td></tr>
          </table>
        </div>
        <p style="text-align: center; color: #999; margin-top: 20px; font-size: 13px;">
          Email này được gửi tự động từ CRM Báo Giá — admin.tranhoangnhu.website
        </p>
      </div>
    `;
  }
}
