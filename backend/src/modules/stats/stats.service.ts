import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { RealEstate } from '../real-estate/real-estate.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Payment } from '../payment/payment.entity';
import { Contract } from '../contract/contract.entity';
import {
  ContractStats,
  MonthlyPoint,
  OverviewStats,
  PropertyStats,
  ReservationStats,
  RevenueStats,
} from './dto/stats.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RealEstate)
    private realEstateRepo: Repository<RealEstate>,
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Contract) private contractRepo: Repository<Contract>,
  ) {}

  async getOverview(): Promise<OverviewStats> {
    const [
      totalProperties,
      totalUsers,
      totalReservations,
      totalContracts,
      totalPayments,
    ] = await Promise.all([
      this.realEstateRepo.count(),
      this.userRepo.count(),
      this.reservationRepo.count(),
      this.contractRepo.count(),
      this.paymentRepo.count(),
    ]);

    const revenueResult: { total: string } | undefined = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .getRawOne();

    return {
      totalProperties,
      totalUsers,
      totalReservations,
      totalContracts,
      totalPayments,
      totalRevenue: Number(revenueResult?.total ?? 0),
    };
  }

  async getRevenue(): Promise<RevenueStats> {
    const rows: { month: string; value: string }[] = await this.paymentRepo
      .createQueryBuilder('p')
      .select("TO_CHAR(p.date, 'YYYY-MM')", 'month')
      .addSelect('SUM(p.amount)', 'value')
      .where("p.date >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(p.date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthly = this.fillMissingMonths(
      rows.map((r) => ({ month: r.month, value: Number(r.value) })),
    );

    const totalResult: { total: string } | undefined = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .getRawOne();

    return {
      monthly,
      total: Number(totalResult?.total ?? 0),
    };
  }

  async getReservations(): Promise<ReservationStats> {
    const rows: { month: string; value: string }[] = await this.reservationRepo
      .createQueryBuilder('r')
      .select("TO_CHAR(r.visitDate, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'value')
      .where("r.visitDate >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(r.visitDate, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthly = this.fillMissingMonths(
      rows.map((r) => ({ month: r.month, value: Number(r.value) })),
    );

    // Distribution by status (enum: pending | confirmed | cancelled)
    const statusRows: { status: string; count: string }[] =
      await this.reservationRepo
        .createQueryBuilder('r')
        .select('r.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('r.status')
        .getRawMany();

    const byStatus = { pending: 0, confirmed: 0, cancelled: 0 };
    for (const row of statusRows) {
      if (row.status in byStatus) {
        byStatus[row.status as keyof typeof byStatus] = Number(row.count);
      }
    }

    return { monthly, byStatus };
  }

  async getProperties(): Promise<PropertyStats> {
    // Distribution by status (0=available/for_sale, 1=for_rent, 2=sold, 3=rented)
    const statusRows: { status: number; count: string }[] =
      await this.realEstateRepo
        .createQueryBuilder('re')
        .select('re.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('re.status')
        .getRawMany();

    const byStatus = { available: 0, rented: 0, sold: 0, reserved: 0 };
    const statusMap: Record<number, keyof typeof byStatus> = {
      0: 'available', // FOR_SALE
      1: 'reserved', // FOR_RENT
      2: 'sold', // SOLD
      3: 'rented', // RENTED
    };
    for (const row of statusRows) {
      const key = statusMap[row.status];
      if (key) byStatus[key] = Number(row.count);
    }

    // Top 5 rated properties
    const topRated: {
      id: string;
      title: string;
      avgRating: string;
      totalComments: string;
    }[] = await this.realEstateRepo
      .createQueryBuilder('re')
      .select('re.id', 'id')
      .addSelect('re.title', 'title')
      .addSelect(
        (sub) =>
          sub
            .select('COALESCE(AVG(c.rating), 0)')
            .from('comments', 'c')
            .where('c."realEstateId" = re.id'),
        'avgRating',
      )
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(c.id)')
            .from('comments', 'c')
            .where('c."realEstateId" = re.id'),
        'totalComments',
      )
      // Filter
      .where(
        `(
          SELECT COUNT(c2.id)
          FROM comments c2
          WHERE c2."realEstateId" = re.id
        ) > 0`,
      )
      .orderBy('"avgRating"', 'DESC')
      .addOrderBy('"totalComments"', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      byStatus,
      topRated: topRated.map((r) => ({
        id: r.id,
        title: r.title,
        avgRating: Number(r.avgRating),
        totalComments: Number(r.totalComments),
      })),
    };
  }

  async getContracts(): Promise<ContractStats> {
    // Contrats last 12 months
    const rows: { month: string; value: string }[] = await this.contractRepo
      .createQueryBuilder('c')
      .select("TO_CHAR(c.startDate, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'value')
      .where("c.startDate >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(c.startDate, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthly = this.fillMissingMonths(
      rows.map((r) => ({ month: r.month, value: Number(r.value) })),
    );

    // Vente vs location
    const [bySale, byRental] = await Promise.all([
      this.contractRepo
        .createQueryBuilder('c')
        .where('c.endDate IS NULL')
        .getCount(),
      this.contractRepo
        .createQueryBuilder('c')
        .where('c.endDate IS NOT NULL')
        .getCount(),
    ]);

    return { monthly, bySale, byRental };
  }

  // ── Helper : fill in the missing months over 12 months ───
  private fillMissingMonths(data: MonthlyPoint[]): MonthlyPoint[] {
    const map = new Map(data.map((p) => [p.month, p.value]));
    const result: MonthlyPoint[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ month: key, value: map.get(key) ?? 0 });
    }

    return result;
  }
}
