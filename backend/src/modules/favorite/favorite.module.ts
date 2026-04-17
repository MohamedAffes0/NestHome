import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealEstate } from '../real-estate/real-estate.entity';
import { Favorite } from './favorite.entity';

@Module({
  controllers: [FavoriteController],
  providers: [FavoriteService],
  imports: [TypeOrmModule.forFeature([Favorite, RealEstate])],
})
export class FavoriteModule {}
