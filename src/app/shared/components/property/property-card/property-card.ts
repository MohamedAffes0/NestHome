import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealEstateWithStats, RealEstateType, RealEstateStatus } from '../../../../core/models';
import { FavoriteService, AuthService } from '../../../../core/services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.html',
  styleUrls: ['./property-card.css']
})
export class PropertyCard implements OnInit {
  @Input() property!: RealEstateWithStats;

  isFavorite  = false;
  isToggling  = false;

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Sync initial state from the shared BehaviorSubject
    this.favoriteService.favoritedIds$.subscribe(ids => {
      this.isFavorite = ids.has(this.property.id);
    });
  }

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.authService.currentUser) return; // not logged in → ignore
    if (this.isToggling) return;

    this.isToggling = true;

    this.favoriteService.switchFavorite(this.property.id).subscribe({
      next: () => { this.isToggling = false; },
      error: () => { this.isToggling = false; },
    });
  }

  // ── Labels ──────────────────────────────────────────────

  get isSale(): boolean {
    return this.property.status === RealEstateStatus.FOR_SALE || this.property.status === RealEstateStatus.SOLD;
  }

  get statusLabel(): string {
    switch (this.property.status) {
      case RealEstateStatus.FOR_SALE: return 'À Vendre';
      case RealEstateStatus.FOR_RENT: return 'À Louer';
      case RealEstateStatus.SOLD:     return 'Vendu';
      case RealEstateStatus.RENTED:   return 'Loué';
    }
  }

  get typeLabel(): string {
    switch (this.property.type) {
      case RealEstateType.HOUSE:     return 'Maison';
      case RealEstateType.APARTMENT: return 'Appartement';
      case RealEstateType.LAND:      return 'Terrain';
      case RealEstateType.BUSINESS:  return 'Commerce';
    }
  }

  get priceUnit(): string {
    return this.property.status === RealEstateStatus.FOR_RENT || this.property.status === RealEstateStatus.RENTED
      ? 'DT/mois' : 'DT';
  }

  get mainImage(): string {
    return this.property.images?.[0]
      ?? 'assets/images/default-property.jpg';
  }
}