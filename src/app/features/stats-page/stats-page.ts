import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { StatsService } from '../../core/services';
import {
  OverviewStats,
  RevenueStats,
  ReservationStats,
  PropertyStats,
  ContractStats,
} from '../../core/models';
import { StatsRevenueChart } from '../../shared/components/stats/stats-revenue-chart/stats-revenue-chart';
import { StatsTopRated } from '../../shared/components/stats/stats-top-rated/stats-top-rated';
import { StatsContractsChart } from '../../shared/components/stats/stats-contracts-chart/stats-contracts-chart';
import { StatsPropertiesChart } from '../../shared/components/stats/stats-properties-chart/stats-properties-chart';
import { StatsReservationsChart } from '../../shared/components/stats/stats-reservations-chart/stats-reservations-chart';
import { StatsKpiCards } from '../../shared/components/stats/stats-kpi-cards/stats-kpi-cards';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [
    CommonModule,
    StatsKpiCards,
    StatsRevenueChart,
    StatsReservationsChart,
    StatsPropertiesChart,
    StatsContractsChart,
    StatsTopRated,
  ],
  templateUrl: './stats-page.html',
  styleUrls: ['./stats-page.css'],
})
export class StatsPage implements OnInit {
  overview: OverviewStats | null = null;
  revenue: RevenueStats | null = null;
  reservations: ReservationStats | null = null;
  properties: PropertyStats | null = null;
  contracts: ContractStats | null = null;

  loading = true;
  error = '';

  constructor(
    private statsService: StatsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      overview: this.statsService.getOverview(),
      revenue: this.statsService.getRevenue(),
      reservations: this.statsService.getReservations(),
      properties: this.statsService.getProperties(),
      contracts: this.statsService.getContracts(),
    }).subscribe({
      next: (data) => {
        this.overview = data.overview;
        this.revenue = data.revenue;
        this.reservations = data.reservations;
        this.properties = data.properties;
        this.contracts = data.contracts;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erreur lors du chargement des statistiques.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get today(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
