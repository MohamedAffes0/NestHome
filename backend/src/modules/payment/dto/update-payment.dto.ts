import { IsOptional, IsNumber } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  amount?: number;
}
