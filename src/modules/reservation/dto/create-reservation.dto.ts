import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumberString,
  Length,
} from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  cinPassport!: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(8)
  clientPhone!: string;

  @IsNotEmpty()
  @IsDateString()
  visitDate!: string;

  @IsNotEmpty()
  @IsString()
  visitTime!: string;
}
