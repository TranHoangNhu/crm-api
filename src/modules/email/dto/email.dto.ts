import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendQuoteEmailDto {
  @IsString()
  @IsNotEmpty()
  quote_id: string;
}

export class TestEmailDto {
  @IsString()
  @IsNotEmpty()
  smtp_host: string;

  @IsNumber()
  @IsOptional()
  smtp_port?: number;

  @IsString()
  @IsNotEmpty()
  smtp_user: string;

  @IsString()
  @IsNotEmpty()
  smtp_password: string;

  @IsEmail()
  @IsOptional()
  from_email?: string;

  @IsString()
  @IsOptional()
  from_name?: string;

  @IsBoolean()
  @IsOptional()
  use_ssl?: boolean;

  @IsEmail()
  @IsNotEmpty()
  to_email: string;
}
