import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
  IsUUID,
  IsEnum,
  IsArray,
} from 'class-validator';
import { RealEstateType, RealEstateStatus } from '../real-estate.entity';
import { Transform } from 'class-transformer';

export class UpdateRealEstateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsEnum(RealEstateType)
  type?: RealEstateType;

  @IsOptional()
  @IsEnum(RealEstateStatus)
  status?: RealEstateStatus;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  rooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  surface?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bathroom?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === '' || (Array.isArray(value) && value.length === 0)) return [];
    return (Array.isArray(value) ? value.filter(Boolean) : [value]) as string[];
  })
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (value === '' || (Array.isArray(value) && value.length === 0)) return [];
    return (Array.isArray(value) ? value.filter(Boolean) : [value]) as string[];
  })
  @IsArray()
  @IsString({ each: true })
  imagesToKeep?: string[];
}
