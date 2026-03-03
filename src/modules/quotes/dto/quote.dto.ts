import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

class QuoteItemDto {
  @IsString()
  module_id: string;

  @IsString()
  module_name: string;

  @IsOptional()
  @IsString()
  module_description: string | null;

  @IsOptional()
  @IsString()
  module_category: string | null;

  @IsNumber()
  @Min(0)
  base_price: number;

  @IsOptional()
  @IsNumber()
  custom_price: number | null;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  estimated_days: number | null;

  @IsNumber()
  sort_order: number;
}

export class CreateQuoteDto {
  @IsString()
  customer_id: string;

  @IsOptional()
  @IsString()
  preset_id: string | null;

  @IsString()
  title: string;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsString()
  discount_type: 'percent' | 'fixed';

  @IsOptional()
  @IsNumber()
  discount_value: number;

  @IsNumber()
  total_amount: number;

  @IsEnum(QuoteStatus)
  status: QuoteStatus;

  @IsOptional()
  @IsString()
  share_token: string | null;

  @IsOptional()
  @IsArray()
  pages: string[];

  @IsOptional()
  @IsArray()
  admin_modules: string[];

  @IsOptional()
  @IsArray()
  team_members: any[];

  @IsOptional()
  @IsString()
  notes: string | null;

  @IsOptional()
  @IsNumber()
  total_estimated_days: number | null;

  @IsOptional()
  @IsNumber()
  warranty_months: number;

  @IsOptional()
  @IsNumber()
  trial_days: number;

  @IsOptional()
  @IsNumber()
  max_revisions: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];
}

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  status: QuoteStatus;
}

export class CreateNewVersionDto {
  @IsString()
  parent_quote_id: string;
}
