import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { RealEstateService } from '../../core/services';
import { RealEstateDetail, CreateRealEstateDto, UpdateRealEstateDto } from '../../core/models';
import { Alert } from '../../shared/components/alert/alert';
import { PropertyFormBasic } from '../../shared/components/property-form/property-form-basic/property-form-basic';
import { PropertyFormEquipment } from '../../shared/components/property-form/property-form-equipment/property-form-equipment';
import { PropertyFormImages } from '../../shared/components/property-form/property-form-images/property-form-images';

@Component({
  selector: 'app-property-form-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, Alert,
    PropertyFormBasic, PropertyFormEquipment, PropertyFormImages,
  ],
  templateUrl: './property-form-page.html',
  styleUrls:   ['./property-form-page.css']
})
export class PropertyFormPage implements OnInit, OnDestroy {

  mode: 'create' | 'edit' = 'create';
  propertyId: string | null = null;

  existing:    RealEstateDetail | null = null;
  loading      = false;
  saving       = false;
  loadError    = '';
  saveError    = '';
  saveSuccess  = false;

  basicDto:   Partial<CreateRealEstateDto> = {};
  basicValid  = false;

  equipment:    string[] = [];
  imagePayload: { toKeep: string[]; newFiles: File[] } = { toKeep: [], newFiles: [] };

  private routeSub!: Subscription;

  constructor(
    private route:             ActivatedRoute,
    private router:            Router,
    private realEstateService: RealEstateService,
    private cdr:               ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Use params$ (observable) to react to changes of route
    this.routeSub = this.route.params.subscribe(params => {
      this.propertyId = params['id'] ?? null;
      this.mode       = this.propertyId ? 'edit' : 'create';

      // Reset the state on each route change
      this.existing     = null;
      this.basicDto     = {};
      this.basicValid   = false;
      this.equipment    = [];
      this.imagePayload = { toKeep: [], newFiles: [] };
      this.loadError    = '';
      this.saveError    = '';
      this.saveSuccess  = false;

      if (this.mode === 'edit' && this.propertyId) {
        this.loadExisting(this.propertyId);
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadExisting(id: string): void {
    this.loading   = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.realEstateService.getById(id).subscribe({
      next: (data) => {
        this.existing  = data;
        this.equipment = [...(data.equipment ?? [])];
        // imagePayload.toKeep will be initialized by PropertyFormImages via [existingImages]
        this.loading   = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading   = false;
        this.loadError = 'Impossible de charger ce bien.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Reception from Child Components ─────────────────────
  onBasicChange(event: { data: Partial<CreateRealEstateDto>; valid: boolean }): void {
    this.basicDto   = event.data;
    this.basicValid = event.valid;
  }

  onEquipmentChange(equipment: string[]): void {
    this.equipment = equipment;
  }

  onImagesChange(payload: { toKeep: string[]; newFiles: File[] }): void {
    this.imagePayload = payload;
  }

  get canSubmit(): boolean {
    return this.basicValid && !this.saving;
  }

  // ── Soumission ────────────────────────────────────────
  onSubmit(): void {
    if (!this.canSubmit) return;

    this.saving      = true;
    this.saveError   = '';
    this.saveSuccess = false;
    this.cdr.detectChanges();

    if (this.mode === 'create') {

      const createDto: CreateRealEstateDto = {
        ...(this.basicDto as CreateRealEstateDto),
        equipment: this.equipment,
      };

      this.realEstateService.create(createDto, this.imagePayload.newFiles).subscribe({
        next: (created) => {
          this.saving      = false;
          this.saveSuccess = true;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/real-estate', created.id]), 1200);
        },
        error: (err) => {
          this.saving    = false;
          this.saveError = this.mapError(err, 'Erreur lors de la création.');
          this.cdr.detectChanges();
        }
      });

    } else {

      const updateDto: UpdateRealEstateDto = {
        ...this.basicDto,
        equipment:    this.equipment,
        imagesToKeep: this.imagePayload.toKeep,
      };

      this.realEstateService.update(this.propertyId!, updateDto, this.imagePayload.newFiles).subscribe({
        next: () => {
          this.saving      = false;
          this.saveSuccess = true;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/management']), 1200);
        },
        error: (err) => {
          this.saving    = false;
          this.saveError = this.mapError(err, 'Erreur lors de la mise à jour.');
          this.cdr.detectChanges();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/management']);
  }

  private mapError(err: any, fallback: string): string {
    const status  = err?.status;
    const raw     = err?.error?.message ?? err?.message ?? '';
    const message = Array.isArray(raw) ? raw.join(', ') : String(raw);
    if (status === 401 || status === 403) return 'Session expirée. Veuillez vous reconnecter.';
    if (status === 404) return 'Ce bien est introuvable.';
    if (status === 400) return message || 'Données invalides. Vérifiez les champs.';
    if (status === 0 || status >= 500) return 'Serveur indisponible. Réessayez plus tard.';
    return message || fallback;
  }
}