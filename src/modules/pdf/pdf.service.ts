import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { formatVnd, formatDate, numberToVndText } from '../../common/utils/format';

@Injectable()
export class PdfService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getAdminClient();
  }

  // ============ QUOTE PDF ============

  async generateQuotePdf(quoteId: string): Promise<string> {
    // 1. Fetch quote + items + customer + company
    const { data: quote, error: qErr } = await this.db
      .from('quotes')
      .select('*, customer:customers(*)')
      .eq('id', quoteId)
      .single();

    if (qErr || !quote) throw new NotFoundException('Không tìm thấy báo giá');

    const { data: items } = await this.db
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('sort_order');

    const { data: company } = await this.db
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    // Fetch contract & payments if exists
    const { data: contract } = await this.db
      .from('contracts')
      .select('*')
      .eq('quote_id', quoteId)
      .maybeSingle();

    let payments: any[] = [];
    if (contract) {
      const { data: ps } = await this.db
        .from('payment_schedules')
        .select('*')
        .eq('contract_id', contract.id)
        .order('sort_order');
      payments = ps || [];
    }

    const statusLabel = this.getStatusLabel(quote.status);

    return this.buildQuoteHtml(
      quote,
      company,
      quote.customer,
      items || [],
      payments,
      statusLabel,
      contract,
    );
  }

  // ============ CONTRACT PDF ============

  async generateContractPdf(contractId: string): Promise<string> {
    const { data: contract, error } = await this.db
      .from('contracts')
      .select('*, customer:customers(*)')
      .eq('id', contractId)
      .single();

    if (error || !contract)
      throw new NotFoundException('Không tìm thấy hợp đồng');

    const { data: company } = await this.db
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    const { data: payments } = await this.db
      .from('payment_schedules')
      .select('*')
      .eq('contract_id', contractId)
      .order('sort_order');

    return this.buildContractHtml(
      contract,
      company,
      contract.customer,
      payments || [],
    );
  }

  // ============ HANDOVER PDF ============

  async generateHandoverPdf(contractId: string): Promise<string> {
    const { data: contract, error } = await this.db
      .from('contracts')
      .select('*, customer:customers(*)')
      .eq('id', contractId)
      .single();

    if (error || !contract)
      throw new NotFoundException('Không tìm thấy hợp đồng');

    const { data: company } = await this.db
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    const { data: handover } = await this.db
      .from('handovers')
      .select('*')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (!handover) throw new NotFoundException('Chưa có dữ liệu bàn giao');

    const { data: milestones } = await this.db
      .from('milestones')
      .select('*')
      .eq('contract_id', contractId)
      .order('sort_order');

    const { data: payments } = await this.db
      .from('payment_schedules')
      .select('*')
      .eq('contract_id', contractId)
      .order('sort_order');

    return this.buildHandoverHtml(
      contract,
      company,
      contract.customer,
      handover,
      milestones || [],
      payments || [],
    );
  }

  // ============ HELPERS ============

  private getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'Nháp',
      SENT: 'Đã gửi',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
      EXPIRED: 'Hết hạn',
    };
    return map[status] || status;
  }

  // ============ HTML BUILDERS (Placeholders — real templates from Next.js) ============

  /**
   * NOTE: These HTML builders will be migrated from the existing Next.js
   * API routes (generateQuotePdfHtml, generateContractHtml, generateHandoverHtml).
   * They contain 300-400+ lines of HTML template each.
   * For now, returning minimal HTML to verify the pipeline works.
   *
   * TODO: Copy full HTML templates from:
   * - crm-web-app/src/app/api/pdf/quote/route.ts → generateQuotePdfHtml()
   * - crm-web-app/src/app/api/pdf/contract/route.ts → generateContractHtml()
   * - crm-web-app/src/app/api/pdf/handover/route.ts → generateHandoverHtml()
   */

  private buildQuoteHtml(
    quote: any,
    company: any,
    customer: any,
    items: any[],
    payments: any[],
    statusLabel: string,
    contract: any,
  ): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Phụ lục báo giá - ${quote.title}</title>
<style>body{font-family:'Noto Serif',serif;max-width:800px;margin:0 auto;padding:40px;}</style></head>
<body>
<h1>PHỤ LỤC BÁO GIÁ</h1>
<p><strong>Dự án:</strong> ${quote.title}</p>
<p><strong>Khách hàng:</strong> ${customer?.name || 'N/A'}</p>
<p><strong>Trạng thái:</strong> ${statusLabel}</p>
<p><strong>Tổng giá trị:</strong> ${formatVnd(quote.total_amount || 0)}</p>
<p><em>Bằng chữ: ${numberToVndText(quote.total_amount || 0)}</em></p>
<hr>
<h2>Chi tiết hạng mục (${items.length} mục)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
<tr><th>STT</th><th>Hạng mục</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr>
${items.map((item, i) => {
  const price = item.custom_price || item.base_price || 0;
  return `<tr><td>${i + 1}</td><td>${item.module_name}</td><td>${formatVnd(price)}</td><td>${item.quantity}</td><td>${formatVnd(price * item.quantity)}</td></tr>`;
}).join('')}
</table>
<p style="margin-top:20px;">Ngày tạo: ${formatDate(quote.created_at)}</p>
<!-- TODO: Replace with full template from Next.js generateQuotePdfHtml -->
</body></html>`;
  }

  private buildContractHtml(
    contract: any,
    company: any,
    customer: any,
    payments: any[],
  ): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Hợp đồng - ${contract.title}</title>
<style>body{font-family:'Noto Serif',serif;max-width:800px;margin:0 auto;padding:40px;}</style></head>
<body>
<h1>HỢP ĐỒNG DỊCH VỤ</h1>
<p><strong>Số HĐ:</strong> ${contract.contract_number}</p>
<p><strong>Dự án:</strong> ${contract.title}</p>
<p><strong>Giá trị:</strong> ${formatVnd(contract.total_price || 0)}</p>
<p><em>(${numberToVndText(contract.total_price || 0)})</em></p>
<hr>
<h2>Đợt thanh toán</h2>
${payments.map((p, i) => `<p>${p.phase_name}: ${formatVnd(p.amount)} (${p.percent}%)</p>`).join('')}
<p>Ngày lập: ${formatDate(contract.contract_date, 'long')}</p>
<!-- TODO: Replace with full 11-article template from Next.js generateContractHtml -->
</body></html>`;
  }

  private buildHandoverHtml(
    contract: any,
    company: any,
    customer: any,
    handover: any,
    milestones: any[],
    payments: any[],
  ): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Biên bản bàn giao - ${contract.title}</title>
<style>body{font-family:'Noto Serif',serif;max-width:800px;margin:0 auto;padding:40px;}</style></head>
<body>
<h1>BIÊN BẢN BÀN GIAO & NGHIỆM THU</h1>
<p><strong>Dự án:</strong> ${contract.title}</p>
<p><strong>Website:</strong> ${handover.website_url || 'N/A'}</p>
<p><strong>Admin:</strong> ${handover.admin_url || 'N/A'}</p>
<p><strong>Trạng thái:</strong> ${handover.status}</p>
<hr>
<h2>Milestones (${milestones.length})</h2>
${milestones.map((m) => `<p>✅ ${m.title} — ${m.progress}%</p>`).join('')}
<!-- TODO: Replace with full template from Next.js generateHandoverHtml -->
</body></html>`;
  }
}
