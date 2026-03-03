import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateQuotePdfDto {
  @IsUUID()
  @IsNotEmpty()
  quote_id: string;
}

export class GenerateContractPdfDto {
  @IsUUID()
  @IsNotEmpty()
  contract_id: string;
}

export class GenerateHandoverPdfDto {
  @IsUUID()
  @IsNotEmpty()
  contract_id: string;
}
