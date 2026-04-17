import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumberString,
  IsUUID,
  IsIn,
} from 'class-validator';
import { RealEstateType, RealEstateStatus } from '../real-estate.entity';

export class RealEstateFilterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(RealEstateType)
  type?: RealEstateType;

  @IsOptional()
  @IsEnum(RealEstateStatus)
  status?: RealEstateStatus;

  @IsOptional()
  @IsNumberString()
  minRooms?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsNumberString()
  minSurface?: string;

  @IsOptional()
  @IsNumberString()
  maxSurface?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortByPrice?: 'asc' | 'desc';

  @IsOptional()
  @IsUUID()
  agentId?: string;
}
