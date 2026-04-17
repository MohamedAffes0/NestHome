import {
  Component, Input, ViewChild, ElementRef,
  AfterViewInit, OnChanges, OnDestroy, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { RevenueStats } from '../../../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-revenue-chart.html',
  styleUrls: ['./stats-revenue-chart.css'],
})
export class StatsRevenueChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: RevenueStats | null = null;

  @ViewChild('revenueCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
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

  private getLabels(): string[] {
    return (this.data?.monthly ?? []).map(p => p.month);
  }

  private getValues(): number[] {
    return (this.data?.monthly ?? []).map(p => p.value);
  }

  private initChart(): void {
    if (!this.canvasRef) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0,   'rgba(30, 58, 110, 0.30)');
    gradient.addColorStop(0.6, 'rgba(30, 58, 110, 0.08)');
    gradient.addColorStop(1,   'rgba(30, 58, 110, 0.00)');

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.getLabels(),
        datasets: [{
          label: 'Revenus (DT)',
          data:  this.getValues(),
          borderColor: '#1e3a6e',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#1e3a6e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a2744',
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: '#f2cc6a',
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y != null ? ctx.parsed.y.toLocaleString('fr-FR') : '0'} DT`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9aa3b2', font: { size: 11, family: 'Inter' } },
          },
          y: {
            grid: { color: 'rgba(226,230,238,0.6)', lineWidth: 1 },
            border: { dash: [4, 4] },
            ticks: {
              color: '#9aa3b2',
              font: { size: 11, family: 'Inter' },
              callback: (v) => {
                const n = Number(v);
                if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
                return n.toString();
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;
    this.chart.data.labels = this.getLabels();
    this.chart.data.datasets[0].data = this.getValues();
    this.chart.update('active');
  }

  get totalRevenue(): string {
    const t = this.data?.total ?? 0;
    if (t >= 1_000_000) return (t / 1_000_000).toFixed(2) + ' M DT';
    if (t >= 1_000)     return (t / 1_000).toFixed(1) + ' K DT';
    return t.toLocaleString('fr-FR') + ' DT';
  }

  get monthCount(): number {
    return this.data?.monthly?.length ?? 0;
  }
}