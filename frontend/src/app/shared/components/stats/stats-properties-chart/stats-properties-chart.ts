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
import { PropertyStats } from '../../../../core/models';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-properties-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-properties-chart.html',
  styleUrls: ['./stats-properties-chart.css'],
})
export class StatsPropertiesChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: PropertyStats | null = null;

  @ViewChild('propCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
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
    const s = this.data?.byStatus;
    return (s?.available ?? 0) + (s?.rented ?? 0) + (s?.sold ?? 0) + (s?.reserved ?? 0);
  }

  private getData(): number[] {
    const s = this.data?.byStatus;
    return [s?.available ?? 0, s?.rented ?? 0, s?.sold ?? 0, s?.reserved ?? 0];
  }

  private initChart(): void {
    if (!this.canvasRef) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'Loués', 'Vendus', 'Réservés'],
        datasets: [
          {
            data: this.getData(),
            backgroundColor: ['#1e3a6e', '#2563eb', '#16a34a', '#d4a017'],
            hoverBackgroundColor: ['#254f96', '#3b82f6', '#22c55e', '#e8b830'],
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
        cutout: '68%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1a2744',
            bodyColor: '#f2cc6a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = this.getData();
    this.chart.update('active');
  }

  get stats() {
    const s = this.data?.byStatus;
    return [
      { label: 'Disponibles', value: s?.available ?? 0, color: '#1e3a6e' },
      { label: 'Loués', value: s?.rented ?? 0, color: '#2563eb' },
      { label: 'Vendus', value: s?.sold ?? 0, color: '#16a34a' },
      { label: 'Réservés', value: s?.reserved ?? 0, color: '#d4a017' },
    ];
  }
}
