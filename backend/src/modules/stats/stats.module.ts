import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../user/user.entity';
import { RealEstate } from '../real-estate/real-estate.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Payment } from '../payment/payment.entity';
import { Contract } from '../contract/contract.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      RealEstate,
      Reservation,
      Payment,
      Contract,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
