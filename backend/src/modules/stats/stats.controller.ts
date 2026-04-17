import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/types/permissions.types';

@Controller('stats')
@UseGuards(PermissionsGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /stats/overview
   * Global counters: properties, users, reservations, contracts, payments, total revenue
   */
  @Get('overview')
  @RequirePermissions(Permission.VIEW_STATS)
  getOverview() {
    return this.statsService.getOverview();
  }

  /**
   * GET /stats/revenue
   * Monthly revenue (12 months) + cumulative total
   */
  @Get('revenue')
  @RequirePermissions(Permission.VIEW_STATS)
  getRevenue() {
    return this.statsService.getRevenue();
  }

  /**
   * GET /stats/reservations
   * Monthly reservations + distribution of pending/confirmed/cancelled
   */
  @Get('reservations')
  @RequirePermissions(Permission.VIEW_STATS)
  getReservations() {
    return this.statsService.getReservations();
  }

  /**
   * GET /stats/properties
   * Property distribution by status + top 5 best-rated properties
   */
  @Get('properties')
  @RequirePermissions(Permission.VIEW_STATS)
  getProperties() {
    return this.statsService.getProperties();
  }

  /**
   * GET /stats/contracts
   * Monthly contracts + total sales vs rentals
   */
  @Get('contracts')
  @RequirePermissions(Permission.VIEW_STATS)
  getContracts() {
    return this.statsService.getContracts();
  }
}
