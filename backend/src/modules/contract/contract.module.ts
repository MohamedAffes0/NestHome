import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { Contract } from './contract.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealEstate } from '../real-estate/real-estate.entity';

@Module({
  controllers: [ContractController],
  providers: [ContractService],
  imports: [TypeOrmModule.forFeature([Contract, RealEstate])],
})
export class ContractModule {}
