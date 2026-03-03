import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

class PaymentScheduleDto {
  @IsString()
  phase_name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNumber()
  percent: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  due_description: string;

  @IsOptional()
  @IsString()
  payment_status: string;

  @IsNumber()
  sort_order: number;
}

export class CreateContractDto {
  @IsString()
  quote_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  title: string;

  @IsString()
  contract_date: string;

  @IsNumber()
  total_price: number;

  @IsOptional()
  @IsString()
  total_price_text: string;

  @IsOptional()
  @IsNumber()
  late_interest_rate: number;

  @IsOptional()
  @IsNumber()
  warranty_months: number;

  @IsOptional()
  @IsNumber()
  trial_days: number;

  @IsOptional()
  @IsNumber()
  max_revisions: number;

  @IsOptional()
  @IsString()
  expected_go_live: string | null;

  @IsOptional()
  @IsString()
  appendix_note: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentScheduleDto)
  payments: PaymentScheduleDto[];
}

export class UpdateContractStatusDto {
  @IsEnum(ContractStatus)
  status: ContractStatus;
}
