import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
  IsEnum,
  IsArray,
  Max,
} from 'class-validator';
import { RealEstateType, RealEstateStatus } from '../real-estate.entity';
import { Transform, Type } from 'class-transformer';

export class CreateRealEstateDto {
  @IsString()
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  title!: string;

  @IsString()
  description: string = '';

  @IsNumber()
  @Min(0, { message: 'Price must be at least 0' })
  price!: number;

  @IsString()
  address!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsEnum(RealEstateType)
  type!: RealEstateType;

  @IsEnum(RealEstateStatus)
  status: RealEstateStatus = RealEstateStatus.FOR_SALE;

  @IsString()
  condition!: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsNumber()
  @Min(0)
  rooms!: number;

  @IsNumber()
  @Min(0)
  surface!: number;

  @IsNumber()
  @Min(0)
  bathroom!: number;

  @IsOptional()
  @Transform(
    ({ value }) => {
      if (!value) return [] as string[];
      return (Array.isArray(value) ? value : [value]) as string[];
    },
    { toClassOnly: true },
  )
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];
}
