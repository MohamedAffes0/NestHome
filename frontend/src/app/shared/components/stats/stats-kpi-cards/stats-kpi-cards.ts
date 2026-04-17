import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OverviewStats } from '../../../../core/models';

interface KpiCard {
  label:   string;
  value:   string | number;
  icon:    SafeHtml;
  color:   string;
  suffix?: string;
}

@Component({
  selector: 'app-stats-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-kpi-cards.html',
  styleUrls: ['./stats-kpi-cards.css'],
})
export class StatsKpiCards {
  @Input() overview: OverviewStats | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  private svg(path: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`,
    );
  }

  get cards(): KpiCard[] {
    const o = this.overview;
    return [
      {
        label: 'Biens immobiliers',
        value: o?.totalProperties ?? 0,
        color: 'navy',
        icon: this.svg(`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`),
      },
      {
        label: 'Utilisateurs',
        value: o?.totalUsers ?? 0,
        color: 'blue',
        icon: this.svg(`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`),
      },
      {
        label: 'Réservations',
        value: o?.totalReservations ?? 0,
        color: 'gold',
        icon: this.svg(`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`),
      },
      {
        label: 'Contrats',
        value: o?.totalContracts ?? 0,
        color: 'green',
        icon: this.svg(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`),
      },
      {
        label: 'Paiements',
        value: o?.totalPayments ?? 0,
        color: 'purple',
        icon: this.svg(`<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`),
      },
      {
        label: 'Revenu total',
        value: this.fmt(o?.totalRevenue ?? 0),
        suffix: 'DT',
        color: 'accent',
        icon: this.svg(`<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`),
      },
    ];
  }

  private fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }
}