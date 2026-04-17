import { IsUUID } from 'class-validator';

export class FavoriteDto {
  @IsUUID()
  realEstateId!: string;
}
