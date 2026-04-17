import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ReservationStatus } from '../reservation.entity';
export class UpdateReservationDto {
  @IsOptional()
  @IsEmail()
  cinPassport?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @IsOptional()
  @IsString()
  visitTime?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
