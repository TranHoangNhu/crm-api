import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class PdfService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getAdminClient();
  }

  async getQuoteData(id: string) {
    let quote: any, customer: any, items: any[], company: any, payments: any[];

    // Try as contract_id first
    const { data: contract } = await this.db
      .from('contracts')
      .select('*, quote:quotes(*, items:quote_items(*)), customer:customers(*)')
      .eq('id', id)
      .maybeSingle();

    if (contract) {
      quote = contract.quote;
      customer = contract.customer;
      items = (quote?.items || []).sort(
        (a: any, b: any) => a.sort_order - b.sort_order,
      );

      const { data: ps } = await this.db
        .from('payment_schedules')
        .select('*')
        .eq('contract_id', id)
        .order('sort_order');
      payments = ps || [];
    } else {
      // Try as quote_id
      const { data: quoteData } = await this.db
        .from('quotes')
        .select('*, customer:customers(*), items:quote_items(*)')
        .eq('id', id)
        .maybeSingle();

      if (!quoteData) throw new NotFoundException('Không tìm thấy báo giá');

      quote = quoteData;
      customer = quoteData.customer;
      items = (quoteData.items || []).sort(
        (a: any, b: any) => a.sort_order - b.sort_order,
      );
      payments = [];
    }

    const { data: companyData } = await this.db
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();
    company = companyData;

    return { quote, company, customer, items, payments, contract };
  }

  async getContractData(contractId: string) {
    const { data: contract, error } = await this.db
      .from('contracts')
      .select('*, customer:customers(*), quote:quotes(*, items:quote_items(*))')
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

    return {
      contract,
      company,
      customer: contract.customer,
      payments: payments || [],
    };
  }

  async getHandoverData(contractId: string) {
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

    return {
      contract,
      company,
      customer: contract.customer,
      handover,
      milestones: milestones || [],
      payments: payments || [],
    };
  }
}
