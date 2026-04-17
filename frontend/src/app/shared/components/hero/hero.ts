import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RealEstateStatus } from '../../../core/models';

export type SearchType = 'acheter' | 'louer';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class Hero {

  searchType: SearchType = 'acheter';
  searchQuery = '';

  stats = [
    { value: '2 400+', label: 'Annonces actives'  },
    { value: '850+',   label: 'Ventes réalisées'  },
    { value: '98%',    label: 'Clients satisfaits' },
  ];

  floatingCards = [
    { icon: '✅', title: 'Bien vérifié',    sub: 'Tunis, Cité Jardins',   position: 'bottom-left' },
    { icon: '🔥', title: 'Très demandé',    sub: '+24 vues aujourd\'hui', position: 'top-right'   },
  ];

  constructor(private router: Router) {}

  setSearchType(type: SearchType): void {
    this.searchType = type;
  }

  onSearch(): void {
    const queryParams: Record<string, any> = {};

    if (this.searchQuery.trim()) {
      queryParams['address'] = this.searchQuery.trim();
    }

    // Mapping searchType to status filter
    queryParams['status'] = this.searchType === 'acheter'
      ? RealEstateStatus.FOR_SALE
      : RealEstateStatus.FOR_RENT;

    this.router.navigate(['/catalogue'], { queryParams });
  }
}