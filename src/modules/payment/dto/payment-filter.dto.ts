import { IsOptional, IsUUID, IsIn } from 'class-validator';

export class PaymentFilterDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  realEstateId?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortByDate?: 'asc' | 'desc';
}
