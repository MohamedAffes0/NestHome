import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

/**
 * DTO for filtering users based on various criteria.
 */
export class UserFilterDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['admin', 'agent', 'user'])
  role?: 'admin' | 'agent' | 'user';

  @IsOptional()
  @IsDateString()
  createdAtMin?: string;

  @IsOptional()
  @IsDateString()
  createdAtMax?: string;

  @IsOptional()
  isActive?: boolean;
}
