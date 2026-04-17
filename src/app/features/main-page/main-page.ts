import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Filter, PropertyFilters } from '../../shared/components/filter/filter';
import { Hero } from '../../shared/components/hero/hero';
import { Pagination } from '../../shared/components/pagination/pagination';
import { RealEstateService } from '../../core/services';
import {
  RealEstateWithStats,
  RealEstateFilterDto,
  RealEstateStatus,
} from '../../core/models';
import { PropertyCard } from '../../shared/components/property/property-card/property-card';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, PropertyCard, Filter, Hero, Pagination],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.css']
})
export class MainPage implements OnInit, OnDestroy {

  properties: RealEstateWithStats[] = [];
  loading  = true;
  errorMsg = '';

  // Pagination
  currentPage = 1;
  totalItems  = 0;
  totalPages  = 1;
  readonly limit = 12;

  activeFilters: PropertyFilters = {
    title: '', type: null, status: null,
    address: '', prixMin: null, prixMax: null,
    rooms: null, minSurface: null,
  };

  private sub!: Subscription;
  // Flag to ignore the first (filtersChange) emit triggered by [initialFilters]
  private skipNextFilterChange = false;

  constructor(
    private realEstateService: RealEstateService,
    private route:  ActivatedRoute,
    private router: Router,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to queryParams to react to URL changes (filters + pagination)
    this.sub = this.route.queryParams.subscribe(params => {
      this.currentPage = 1;

      // Mapping queryParams → activeFilters
      this.activeFilters = {
        title:      '',
        type:       null,
        status:     params['status'] !== undefined
                      ? Number(params['status']) as RealEstateStatus
                      : null,
        address:    params['address'] ?? '',
        prixMin:    null,
        prixMax:    null,
        rooms:   null,
        minSurface: null,
      };

      // Tell the filter it will receive [initialFilters] and it will emit
      // (filtersChange) → we want to ignore this first emit to avoid double-loading
      this.skipNextFilterChange = true;
      this.cdr.detectChanges();

      this.loadProperties();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Loading ────────────────────────────────────────────
  loadProperties(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.realEstateService
      .getAll(this.mapFilters(this.activeFilters), this.currentPage, this.limit)
      .subscribe({
        next: (res) => {
          this.properties = res.items;
          this.totalItems = res.meta.totalItems;
          this.totalPages = res.meta.totalPages;
          this.loading    = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMsg = 'Impossible de charger les annonces. Vérifiez votre connexion.';
          this.loading  = false;
          this.cdr.detectChanges();
        }
      });
  }

  // ── Filtres ───────────────────────────────────────────────
  onFiltersChange(filters: PropertyFilters): void {
    // Ignorer le premier emit causé par la mise à jour de [initialFilters]
    if (this.skipNextFilterChange) {
      this.skipNextFilterChange = false;
      return;
    }
    this.activeFilters = filters;
    this.currentPage   = 1;
    this.router.navigate([], { replaceUrl: true }); // nettoie l'URL
    this.loadProperties();
  }

  // ── Pagination ────────────────────────────────────────────
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPropertyClick(property: RealEstateWithStats): void {
    this.router.navigate(['/bien', property.id]);
  }

  // ── Mapping filtres UI → API ───────────────────────────
  private mapFilters(f: PropertyFilters): RealEstateFilterDto {
    const dto: RealEstateFilterDto = {};
    if (f.title?.trim())        dto.title      = f.title.trim();
    if (f.address?.trim())      dto.address    = f.address.trim();
    if (f.type       !== null)  dto.type       = f.type;
    if (f.status     !== null)  dto.status     = f.status;
    if (f.rooms   !== null)  dto.minRooms   = f.rooms;
    if (f.prixMin    !== null)  dto.minPrice   = f.prixMin;
    if (f.prixMax    !== null)  dto.maxPrice   = f.prixMax;
    if (f.minSurface !== null)  dto.minSurface = f.minSurface;
    return dto;
  }
}