import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './utils/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentModule } from './modules/comment/comment.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { ContractModule } from './modules/contract/contract.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { RealEstateModule } from './modules/real-estate/real-estate.module';
import { PaymentModule } from './modules/payment/payment.module';
import { Comment } from './modules/comment/comment.entity';
import { Favorite } from './modules/favorite/favorite.entity';
import { Contract } from './modules/contract/contract.entity';
import { Reservation } from './modules/reservation/reservation.entity';
import { RealEstate } from './modules/real-estate/real-estate.entity';
import { Payment } from './modules/payment/payment.entity';
import { User } from './modules/user/user.entity';
import { UserModule } from './modules/user/user.module';
import { StatsModule } from './modules/stats/stats.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        Comment,
        Favorite,
        Contract,
        Reservation,
        RealEstate,
        Payment,
        User,
      ],
      synchronize: true,
    }), // Database configuration
    AuthModule.forRoot({
      auth,
      isGlobal: true, // Make auth module global
      disableGlobalAuthGuard: true, // Disable default global auth guard
    }),
    UserModule,
    CommentModule,
    FavoriteModule,
    ContractModule,
    ReservationModule,
    RealEstateModule,
    PaymentModule,
    StatsModule, // Configure better-auth with the auth instance
  ],
  providers: [AppService],
  controllers: [AppController], // Import the AppController
})
export class AppModule {}
