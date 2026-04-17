import {
  Component, Output, EventEmitter, OnInit, Input,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealEstateType, RealEstateStatus } from '../../../core/models';

export interface PropertyFilters {
  title:      string;
  type:       RealEstateType | null;
  status:     RealEstateStatus | null;
  address:    string;
  prixMin:    number | null;
  prixMax:    number | null;
  rooms:   number | null;
  minSurface: number | null;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrls: ['./filter.css']
})
export class Filter implements OnInit, OnChanges {

  @Input() initialFilters: Partial<PropertyFilters> = {};
  @Output() filtersChange = new EventEmitter<PropertyFilters>();

  filters: PropertyFilters = {
    title: '', type: null, status: null,
    address: '', prixMin: null, prixMax: null,
    rooms: null, minSurface: null,
  };

  isOpen = false;

  // ── Options ────────────────────────────────────────────
  types = [
    { value: null,                     label: 'Tous'        },
    { value: RealEstateType.HOUSE,     label: 'Maison'      },
    { value: RealEstateType.APARTMENT, label: 'Appartement' },
    { value: RealEstateType.LAND,      label: 'Terrain'     },
    { value: RealEstateType.BUSINESS,  label: 'Commerce'    },
  ];

  statuses = [
    { value: null,                      label: 'Tous'     },
    { value: RealEstateStatus.FOR_SALE, label: 'À Vendre' },
    { value: RealEstateStatus.FOR_RENT, label: 'À Louer'  },
    { value: RealEstateStatus.SOLD,     label: 'Vendu'    },
    { value: RealEstateStatus.RENTED,   label: 'Loué'     },
  ];

  villes = ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Hammamet', 'Ariana', 'La Marsa', 'Nabeul'];

  chambresOptions = [1, 2, 3, 4, 5];

  // ── Compteur filtres actifs ────────────────────────────
  get activeCount(): number {
    let n = 0;
    if (this.filters.title)               n++;
    if (this.filters.type       !== null) n++;
    if (this.filters.status     !== null) n++;
    if (this.filters.address)             n++;
    if (this.filters.prixMin    !== null) n++;
    if (this.filters.prixMax    !== null) n++;
    if (this.filters.rooms   !== null) n++;
    if (this.filters.minSurface !== null) n++;
    return n;
  }

  ngOnInit(): void {
    this.filters = {
      title: '', type: null, status: null,
      address: '', prixMin: null, prixMax: null,
      rooms: null, minSurface: null,
      ...this.initialFilters,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters']) {
      // Only merge in the new initial values — do NOT emit back
      this.filters = {
        title: '', type: null, status: null,
        address: '', prixMin: null, prixMax: null,
        rooms: null, minSurface: null,
        ...this.initialFilters,
      };
    }
  }

  onFilterChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  setType(value: RealEstateType | null): void {
    this.filters.type = value;
    this.onFilterChange();
  }

  setStatus(value: RealEstateStatus | null): void {
    this.filters.status = value;
    this.onFilterChange();
  }

  setRooms(n: number): void {
    this.filters.rooms = this.filters.rooms === n ? null : n;
    this.onFilterChange();
  }

  reset(): void {
    this.filters = {
      title: '', type: null, status: null,
      address: '', prixMin: null, prixMax: null,
      rooms: null, minSurface: null,
    };
    this.filtersChange.emit({ ...this.filters });
  }

  toggleOpen(): void { this.isOpen = !this.isOpen; }
}