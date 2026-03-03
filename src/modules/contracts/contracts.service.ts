import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CreateContractDto, UpdateContractStatusDto } from './dto/contract.dto';
import { generateContractNumber, numberToVndText } from '../../common/utils/format';

@Injectable()
export class ContractsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateContractDto) {
    const client = this.supabase.getAdminClient();

    // Fetch customer name for contract number generation
    const { data: customer } = await client
      .from('customers')
      .select('name')
      .eq('id', dto.customer_id)
      .single();

    const shortA = 'BETECH';
    const shortB = customer?.name?.split(' ').pop()?.toUpperCase() || 'KH';

    const contractData = {
      quote_id: dto.quote_id,
      customer_id: dto.customer_id,
      contract_number: generateContractNumber(shortA, shortB),
      contract_date: dto.contract_date,
      title: dto.title,
      total_price: dto.total_price,
      total_price_text: dto.total_price_text || numberToVndText(dto.total_price),
      late_interest_rate: dto.late_interest_rate || 0.05,
      warranty_months: dto.warranty_months || 12,
      trial_days: dto.trial_days || 30,
      max_revisions: dto.max_revisions || 3,
      expected_go_live: dto.expected_go_live,
      status: 'DRAFT',
      appendix_note: dto.appendix_note,
    };

    const { data: contract, error } = await client
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Insert payment schedules
    if (dto.payments?.length > 0) {
      const paymentData = dto.payments.map((p, idx) => ({
        ...p,
        contract_id: contract.id,
        sort_order: idx,
        payment_status: p.payment_status || 'PENDING',
      }));

      const { error: payErr } = await client
        .from('payment_schedules')
        .insert(paymentData);

      if (payErr) throw new BadRequestException(payErr.message);
    }

    // Update quote status to ACCEPTED
    await client
      .from('quotes')
      .update({ status: 'ACCEPTED' })
      .eq('id', dto.quote_id);

    return { data: contract, success: true, message: 'Đã khởi tạo Hợp đồng & Phụ lục!' };
  }

  async updateStatus(id: string, dto: UpdateContractStatusDto) {
    const client = this.supabase.getAdminClient();

    const { error } = await client
      .from('contracts')
      .update({ status: dto.status })
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Đã cập nhật trạng thái!' };
  }
}
