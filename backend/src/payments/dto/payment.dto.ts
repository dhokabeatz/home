import { IsString, IsNumber, IsOptional, IsEmail } from "class-validator";

export class InitializePaymentDto {
  @IsString()
  projectId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}

export class VerifyPaymentDto {
  @IsString()
  reference: string;
}
