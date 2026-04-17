import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateRealEstateDto, RealEstate, RealEstateStatus, RealEstateType } from '../../../../core/models';

@Component({
  selector: 'app-property-form-basic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-form-basic.html',
  styleUrls: ['./property-form-basic.css']
})
export class PropertyFormBasic implements OnInit {

  @Input() existing: Partial<RealEstate> | null = null;

  @Output() formChange = new EventEmitter<{ data: Partial<CreateRealEstateDto>; valid: boolean }>();

  form: {
    title:       string;
    description: string;
    price:       number | null;
    address:     string;
    lat:         number | null;
    lng:         number | null;
    type:        RealEstateType | null;
    status:      RealEstateStatus | null;
    condition:   string;
    rooms:       number | null;
    surface:     number | null;
    bathroom:    number | null;
  } = {
    title: '', description: '', price: null,
    address: '', lat: null, lng: null,
    type: null, status: null, condition: '',
    rooms: null, surface: null, bathroom: null,
  };

  readonly types = [
    { value: RealEstateType.HOUSE,     label: 'Maison',      icon: '🏠' },
    { value: RealEstateType.APARTMENT, label: 'Appartement', icon: '🏢' },
    { value: RealEstateType.LAND,      label: 'Terrain',     icon: '🌱' },
    { value: RealEstateType.BUSINESS,  label: 'Commerce',    icon: '🏪' },
  ];

  readonly statuses = [
    { value: RealEstateStatus.FOR_SALE, label: 'À Vendre', color: 'navy' },
    { value: RealEstateStatus.FOR_RENT, label: 'À Louer',  color: 'gold' },
    { value: RealEstateStatus.SOLD,     label: 'Vendu',    color: 'gray' },
    { value: RealEstateStatus.RENTED,   label: 'Loué',     color: 'gray' },
  ];

  readonly conditions = ['Neuf', 'Très bon état', 'Bon état', 'À rénover'];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.existing) {
      this.form = {
        title:       this.existing.title       ?? '',
        description: this.existing.description ?? '',
        price:       this.existing.price       ?? null,
        address:     this.existing.address     ?? '',
        lat:         this.existing.lat         ?? null,
        lng:         this.existing.lng         ?? null,
        type:        this.existing.type        ?? null,
        status:      this.existing.status      ?? null,
        condition:   this.existing.condition   ?? '',
        rooms:       this.existing.rooms       ?? null,
        surface:     this.existing.surface     ?? null,
        bathroom:    this.existing.bathroom    ?? null,
      };
    }
    this.emit();
  }

  // ── Validation ────────────────────────────────────────
  // Required fields: title, price, address, type, status, condition, rooms, surface, bathroom
  // Optional fields: description, lat, lng (map coordinates)
  get isValid(): boolean {
    const latOk = this.form.lat === null || (this.form.lat >= -90  && this.form.lat <= 90);
    const lngOk = this.form.lng === null || (this.form.lng >= -180 && this.form.lng <= 180);

    return !!(
      this.form.title?.trim() &&
      this.form.price  !== null && this.form.price  > 0 &&
      this.form.address?.trim() &&
      latOk && lngOk &&
      this.form.type    !== null &&
      this.form.status  !== null &&
      this.form.condition &&
      this.form.rooms    !== null && this.form.rooms    >= 0 &&
      this.form.surface  !== null && this.form.surface  > 0 &&
      this.form.bathroom !== null && this.form.bathroom >= 0
    );
  }

  get priceUnit(): string {
    return this.form.status === RealEstateStatus.FOR_RENT || this.form.status === RealEstateStatus.RENTED
      ? 'DT / mois' : 'DT';
  }

  // ── Setters ───────────────────────────────────────────
  setType(v: RealEstateType): void     { this.form.type   = v; this.emit(); }
  setStatus(v: RealEstateStatus): void { this.form.status = v; this.emit(); }

  // ── DTO Emission ───────────────────────────
  emit(): void {
    const dto: Partial<CreateRealEstateDto> = {};

    if (this.form.title?.trim())       dto.title       = this.form.title.trim();
    if (this.form.description?.trim()) dto.description = this.form.description.trim();
    if (this.form.price !== null)      dto.price       = this.form.price;
    if (this.form.address?.trim())     dto.address     = this.form.address.trim();
    if (this.form.lat !== null && this.form.lat >= -90  && this.form.lat <= 90)   dto.lat = this.form.lat;
    if (this.form.lng !== null && this.form.lng >= -180 && this.form.lng <= 180)  dto.lng = this.form.lng;
    if (this.form.type    !== null)    dto.type        = this.form.type;
    if (this.form.status  !== null)    dto.status      = this.form.status;
    if (this.form.condition)           dto.condition   = this.form.condition;
    if (this.form.rooms    !== null)   dto.rooms       = this.form.rooms;
    if (this.form.surface  !== null)   dto.surface     = this.form.surface;
    if (this.form.bathroom !== null)   dto.bathroom    = this.form.bathroom;

    this.formChange.emit({ data: dto, valid: this.isValid });
  }
}