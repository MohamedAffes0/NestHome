import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavoriteService } from '../../core/services';
import { RealEstateWithStats } from '../../core/models';
import { PropertyCard } from '../../shared/components/property/property-card/property-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, PropertyCard, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class Favorites implements OnInit {
  properties: RealEstateWithStats[] = [];
  loading  = true;
  errorMsg = '';

  constructor(
    private favoriteService: FavoriteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.favoriteService.getUserFavorites().subscribe({
      next: (favorites) => {
        this.properties = favorites
          .map(f => f.realEstate)
          .filter(Boolean) as RealEstateWithStats[];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger vos favoris.';
        this.loading  = false;
        this.cdr.markForCheck();
      },
    });
  }

  onPropertyClick(property: RealEstateWithStats): void {
    this.router.navigate(['/bien', property.id]);
  }
}