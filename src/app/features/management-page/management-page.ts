import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RealEstateService } from '../../core/services';
import { RealEstateWithStats } from '../../core/models';
import { Alert } from '../../shared/components/alert/alert';
import { ManagementCard } from '../../shared/components/property/management-card/management-card';

@Component({
  selector: 'app-management-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ManagementCard, Alert],
  templateUrl: './management-page.html',
  styleUrls: ['./management-page.css'],
})
export class ManagementPage implements OnInit {
  properties: RealEstateWithStats[] = [];
  loading = true;
  errorMsg = '';

  // Delete Confirmation
  deletingId: string | null = null;
  deleteError = '';
  deleteLoading = false;

  constructor(
    private realEstateService: RealEstateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.realEstateService.getAll({}, 1, 100).subscribe({
      next: (res) => {
        this.properties = res.items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les annonces.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onEdit(id: string): void {
    this.router.navigate(['/management', id, 'edit']);
  }

  onAdd(): void {
    this.router.navigate(['/management/new']);
  }

  // ── Delete ───────────────────────────────────────
  askDelete(id: string): void {
    this.deletingId = id;
    this.deleteError = '';
  }

  cancelDelete(): void {
    this.deletingId = null;
  }

  confirmDelete(): void {
    if (!this.deletingId) return;
    this.deleteLoading = true;
    this.deleteError = '';
    this.cdr.detectChanges();

    this.realEstateService.delete(this.deletingId).subscribe({
      next: () => {
        this.properties = this.properties.filter((p) => p.id !== this.deletingId);
        this.deletingId = null;
        this.deleteLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteError = err?.error?.message ?? 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      },
    });
  }

  get deletingProperty(): RealEstateWithStats | undefined {
    return this.properties.find((p) => p.id === this.deletingId);
  }
}
