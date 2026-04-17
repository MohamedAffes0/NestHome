import { IsUUID, IsString, IsNotEmpty, Min, Max, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  realEstateId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Min(1, { message: 'Mark must be at least 1' })
  @Max(5, { message: 'Mark cannot exceed 5' })
  rating!: number;
}
