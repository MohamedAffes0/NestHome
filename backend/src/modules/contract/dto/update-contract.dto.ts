import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  cinPassport?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
