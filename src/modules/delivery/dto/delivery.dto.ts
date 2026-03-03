import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

// ============ MILESTONES ============

export class CreateMilestoneDto {
  @IsUUID()
  contract_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

export class UpdateMilestoneDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

// ============ MILESTONE LOGS ============

export class CreateMilestoneLogDto {
  @IsUUID()
  milestone_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  created_by_name?: string;
}

// ============ DESIGN VERSIONS ============

export class CreateDesignDto {
  @IsUUID()
  contract_id: string;

  @IsNumber()
  @IsOptional()
  version_number?: number;

  @IsUrl()
  figma_url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateDesignDto {
  @IsUrl()
  @IsOptional()
  figma_url?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  revision_count?: number;
}

// ============ DESIGN FEEDBACKS ============

export class CreateFeedbackDto {
  @IsUUID()
  design_version_id: string;

  @IsString()
  @IsNotEmpty()
  feedback_type: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  created_by_name?: string;
}

// ============ HANDOVERS ============

export class UpsertHandoverDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  contract_id: string;

  @IsUrl()
  @IsOptional()
  website_url?: string;

  @IsUrl()
  @IsOptional()
  admin_url?: string;

  @IsString()
  @IsOptional()
  admin_username?: string;

  @IsString()
  @IsOptional()
  admin_password?: string;

  @IsString()
  @IsOptional()
  guide_file_url?: string;

  @IsString()
  @IsOptional()
  source_code_url?: string;

  @IsString()
  @IsOptional()
  extra_notes?: string;
}

export class UpdateHandoverStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
