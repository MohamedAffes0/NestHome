import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TopRatedItem {
  id: string;
  title: string;
  avgRating: number;
  totalComments: number;
}

@Component({
  selector: 'app-stats-top-rated',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-top-rated.html',
  styleUrls: ['./stats-top-rated.css'],
})
export class StatsTopRated {
  @Input() items: TopRatedItem[] = [];

  stars(rating: number): { full: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ full: i < Math.round(rating) }));
  }

  rankColor(i: number): string {
    return ['#d4a017', '#9aa3b2', '#c07d40'][i] ?? 'var(--navy-100)';
  }
}
