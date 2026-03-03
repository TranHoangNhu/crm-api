import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CreateQuoteDto, UpdateQuoteStatusDto } from './dto/quote.dto';
import { generateQuoteCode, generateShareToken } from '../../common/utils/format';

@Injectable()
export class QuotesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateQuoteDto) {
    const client = this.supabase.getAdminClient();

    const quoteData = {
      customer_id: dto.customer_id,
      preset_id: dto.preset_id,
      quote_code: generateQuoteCode(),
      title: dto.title,
      version: 1,
      subtotal: dto.subtotal,
      discount_type: dto.discount_type || 'percent',
      discount_value: dto.discount_value || 0,
      total_amount: dto.total_amount,
      status: dto.status,
      share_token: dto.status === 'SENT' ? generateShareToken() : null,
      pages: dto.pages || [],
      admin_modules: dto.admin_modules || [],
      team_members: dto.team_members || [],
      notes: dto.notes,
      total_estimated_days: dto.total_estimated_days,
      warranty_months: dto.warranty_months || 12,
      trial_days: dto.trial_days || 30,
      max_revisions: dto.max_revisions || 3,
    };

    const { data: quote, error } = await client
      .from('quotes')
      .insert(quoteData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Insert items
    if (dto.items?.length > 0) {
      const itemsData = dto.items.map((item, idx) => ({
        quote_id: quote.id,
        module_id: item.module_id,
        module_name: item.module_name,
        module_description: item.module_description,
        module_category: item.module_category,
        base_price: item.base_price,
        custom_price: item.custom_price,
        quantity: item.quantity,
        estimated_days: item.estimated_days,
        sort_order: idx,
      }));

      const { error: itemsError } = await client
        .from('quote_items')
        .insert(itemsData);

      if (itemsError) throw new BadRequestException(itemsError.message);
    }

    return { data: quote, success: true };
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    const client = this.supabase.getAdminClient();

    const updateData: any = { status: dto.status };
    if (dto.status === 'SENT') {
      // Check if token exists
      const { data: existing } = await client
        .from('quotes')
        .select('share_token')
        .eq('id', id)
        .single();

      if (!existing?.share_token) {
        updateData.share_token = generateShareToken();
      }
    }

    const { error } = await client
      .from('quotes')
      .update(updateData)
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Đã cập nhật trạng thái!' };
  }

  async deleteQuote(id: string) {
    const client = this.supabase.getAdminClient();

    // Delete related items, contracts, payment_schedules
    await client.from('quote_items').delete().eq('quote_id', id);

    // Check for contracts
    const { data: contracts } = await client
      .from('contracts')
      .select('id')
      .eq('quote_id', id);

    if (contracts && contracts.length > 0) {
      for (const contract of contracts) {
        await client.from('payment_schedules').delete().eq('contract_id', contract.id);
      }
      await client.from('contracts').delete().eq('quote_id', id);
    }

    const { error } = await client.from('quotes').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);

    return { success: true, message: 'Đã xóa báo giá!' };
  }
}
