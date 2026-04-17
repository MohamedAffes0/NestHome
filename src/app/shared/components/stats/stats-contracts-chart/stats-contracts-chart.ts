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
import { ContractStats } from '../../../../core/models';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-contracts-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-contracts-chart.html',
  styleUrls: ['./stats-contracts-chart.css'],
})
export class StatsContractsChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: ContractStats | null = null;

  @ViewChild('contractCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  get total(): number {
    return (this.data?.bySale ?? 0) + (this.data?.byRental ?? 0);
  }
  get saleCount(): number {
    return this.data?.bySale ?? 0;
  }
  get rentalCount(): number {
    return this.data?.byRental ?? 0;
  }

  get salePct(): number {
    return this.total ? Math.round((this.saleCount / this.total) * 100) : 0;
  }
  get rentalPct(): number {
    return this.total ? Math.round((this.rentalCount / this.total) * 100) : 0;
  }

  private initChart(): void {
    if (!this.canvasRef) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    const months = (this.data?.monthly ?? []).map((p) => p.month);
    const values = (this.data?.monthly ?? []).map((p) => p.value);
    const ratio = this.total > 0 ? this.saleCount / this.total : 0.5;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Ventes',
            data: values.map((v) => Math.round(v * ratio)),
            backgroundColor: '#16a34a',
            hoverBackgroundColor: '#22c55e',
            borderRadius: 4,
            borderSkipped: false,
            stack: 'stack',
          },
          {
            label: 'Locations',
            data: values.map((v) => Math.round(v * (1 - ratio))),
            backgroundColor: '#2563eb',
            hoverBackgroundColor: '#3b82f6',
            borderRadius: 4,
            borderSkipped: false,
            stack: 'stack',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              padding: 16,
              font: { size: 11, family: 'Inter' },
              color: '#6b7585',
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: '#1a2744',
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: '#f2cc6a',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: '#9aa3b2', font: { size: 11 } },
          },
          y: {
            stacked: true,
            grid: { color: 'rgba(226,230,238,0.6)' },
            ticks: { color: '#9aa3b2', font: { size: 11 }, stepSize: 1 },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;
    const months = (this.data?.monthly ?? []).map((p) => p.month);
    const values = (this.data?.monthly ?? []).map((p) => p.value);
    const ratio = this.total > 0 ? this.saleCount / this.total : 0.5;
    this.chart.data.labels = months;
    this.chart.data.datasets[0].data = values.map((v) => Math.round(v * ratio));
    this.chart.data.datasets[1].data = values.map((v) => Math.round(v * (1 - ratio)));
    this.chart.update('active');
  }
}
