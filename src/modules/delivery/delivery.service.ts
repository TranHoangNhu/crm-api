import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateMilestoneLogDto,
  CreateDesignDto,
  UpdateDesignDto,
  CreateFeedbackDto,
  UpsertHandoverDto,
  UpdateHandoverStatusDto,
} from './dto/delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getAdminClient();
  }

  // ============ MILESTONES ============

  async getMilestones(contractId: string) {
    const { data, error } = await this.db
      .from('milestones')
      .select('*, logs:milestone_logs(*)')
      .eq('contract_id', contractId)
      .order('sort_order');

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async createMilestone(dto: CreateMilestoneDto) {
    const { data, error } = await this.db
      .from('milestones')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateMilestone(id: string, dto: UpdateMilestoneDto) {
    const { error } = await this.db
      .from('milestones')
      .update(dto)
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  async deleteMilestone(id: string) {
    const { error } = await this.db
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ============ MILESTONE LOGS ============

  async createMilestoneLog(dto: CreateMilestoneLogDto) {
    const { data, error } = await this.db
      .from('milestone_logs')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ============ DESIGN VERSIONS ============

  async getDesigns(contractId: string) {
    const { data, error } = await this.db
      .from('design_versions')
      .select('*, feedbacks:design_feedbacks(*)')
      .eq('contract_id', contractId)
      .order('version_number', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async createDesign(dto: CreateDesignDto) {
    const { data, error } = await this.db
      .from('design_versions')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateDesign(id: string, dto: UpdateDesignDto) {
    const { error } = await this.db
      .from('design_versions')
      .update(dto)
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ============ DESIGN FEEDBACKS ============

  async createFeedback(dto: CreateFeedbackDto) {
    const { data, error } = await this.db
      .from('design_feedbacks')
      .insert(dto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ============ HANDOVERS ============

  async getHandover(contractId: string) {
    const { data, error } = await this.db
      .from('handovers')
      .select('*')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async upsertHandover(dto: UpsertHandoverDto) {
    const { id, ...rest } = dto;
    if (id) {
      const { error } = await this.db
        .from('handovers')
        .update(rest)
        .eq('id', id);
      if (error) throw new BadRequestException(error.message);
    } else {
      const { error } = await this.db.from('handovers').insert(rest);
      if (error) throw new BadRequestException(error.message);
    }
    return { success: true };
  }

  async updateHandoverStatus(id: string, dto: UpdateHandoverStatusDto) {
    const updateData: any = { status: dto.status };
    if (dto.status === 'ACCEPTED') updateData.accepted_at = new Date().toISOString();
    if (dto.status === 'REJECTED') {
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = dto.rejection_reason;
    }

    const { error } = await this.db
      .from('handovers')
      .update(updateData)
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ============ ALL DATA ============

  async getAll(contractId: string) {
    const [msRes, dRes, hRes] = await Promise.all([
      this.db
        .from('milestones')
        .select('*, logs:milestone_logs(*)')
        .eq('contract_id', contractId)
        .order('sort_order'),
      this.db
        .from('design_versions')
        .select('*, feedbacks:design_feedbacks(*)')
        .eq('contract_id', contractId)
        .order('version_number', { ascending: false }),
      this.db
        .from('handovers')
        .select('*')
        .eq('contract_id', contractId)
        .maybeSingle(),
    ]);

    return {
      milestones: msRes.data || [],
      designs: dRes.data || [],
      handover: hRes.data || null,
    };
  }
}
