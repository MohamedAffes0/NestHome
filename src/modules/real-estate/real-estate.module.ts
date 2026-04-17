import { Module } from '@nestjs/common';
import { RealEstateService } from './real-estate.service';
import { RealEstateController } from './real-estate.controller';
import { UploadModule } from '../upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealEstate } from './real-estate.entity';

@Module({
  controllers: [RealEstateController],
  providers: [RealEstateService],

  imports: [
    TypeOrmModule.forFeature([RealEstate]),
    UploadModule, // Import UploadModule to use UploadService
  ],
})
export class RealEstateModule {}
