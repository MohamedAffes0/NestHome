import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationStats } from '../../../../core/models';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-reservations-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-reservations-chart.html',
  styleUrls: ['./stats-reservations-chart.css'],
})
export class StatsReservationsChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: ReservationStats | null = null;

  @ViewChild('barCanvas') barRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutRef!: ElementRef<HTMLCanvasElement>;

  private barChart?: Chart;
  private donutChart?: Chart;

  ngAfterViewInit(): void {
    this.initBarChart();
    this.initDonutChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateBarChart();
      this.updateDonutChart();
    }
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.donutChart?.destroy();
  }

  get total(): number {
    const s = this.data?.byStatus;
    return (s?.pending ?? 0) + (s?.confirmed ?? 0) + (s?.cancelled ?? 0);
  }

  // ── Bar chart ──────────────────────────────────────────
  private initBarChart(): void {
    if (!this.barRef) return;
    const ctx = this.barRef.nativeElement.getContext('2d')!;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: (this.data?.monthly ?? []).map((p) => p.month),
        datasets: [
          {
            label: 'Réservations',
            data: (this.data?.monthly ?? []).map((p) => p.value),
            backgroundColor: 'rgba(30, 58, 110, 0.80)',
            hoverBackgroundColor: '#1e3a6e',
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a2744',
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: '#f2cc6a',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9aa3b2', font: { size: 11 } } },
          y: {
            grid: { color: 'rgba(226,230,238,0.6)' },
            ticks: { color: '#9aa3b2', font: { size: 11 }, stepSize: 1 },
          },
        },
      },
    };

    this.barChart = new Chart(ctx, config);
  }

  private updateBarChart(): void {
    if (!this.barChart) return;
    this.barChart.data.labels = (this.data?.monthly ?? []).map((p) => p.month);
    this.barChart.data.datasets[0].data = (this.data?.monthly ?? []).map((p) => p.value);
    this.barChart.update('active');
  }

  // ── Donut chart ────────────────────────────────────────
  private initDonutChart(): void {
    if (!this.donutRef) return;
    const ctx = this.donutRef.nativeElement.getContext('2d')!;
    const s = this.data?.byStatus;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Confirmées', 'Annulées'],
        datasets: [
          {
            data: [s?.pending ?? 0, s?.confirmed ?? 0, s?.cancelled ?? 0],
            backgroundColor: ['#d4a017', '#22c55e', '#9aa3b2'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: { size: 11, family: 'Inter' },
              color: '#6b7585',
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: '#1a2744',
            bodyColor: '#f2cc6a',
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    };

    this.donutChart = new Chart(ctx, config);
  }

  private updateDonutChart(): void {
    if (!this.donutChart) return;
    const s = this.data?.byStatus;
    this.donutChart.data.datasets[0].data = [s?.pending ?? 0, s?.confirmed ?? 0, s?.cancelled ?? 0];
    this.donutChart.update('active');
  }
}
