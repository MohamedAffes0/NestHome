import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentService, RealEstateService, UserService } from '../../../../core/services';

import { Payment, CreatePaymentDto, RealEstateWithStats, User } from '../../../../core/models';
import { Alert } from '../../alert/alert';

@Component({
  selector: 'app-payment-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './payment-add-modal.html',
  styleUrls: ['./payment-add-modal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentAddModal {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<Payment>();

  // ── Property picker ─────────────────────────────────
  propertySearch = '';
  propertyResults: RealEstateWithStats[] = [];
  selectedProperty: RealEstateWithStats | null = null;

  // ── User picker ──────────────────────────────────────
  userSearch = '';
  userResults: User[] = [];
  selectedUser: User | null = null;

  // ── Form ─────────────────────────────────────────────
  amount: number | null = null;
  loading = false;
  error = '';

  constructor(
    private paymentService: PaymentService,
    private realEstateService: RealEstateService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Property ─────────────────────────────────────────
  onPropertySearch(): void {
    const q = this.propertySearch.trim();
    if (!q) {
      this.propertyResults = [];
      this.cdr.markForCheck();
      return;
    }

    this.realEstateService.getAll({ title: q }, 1, 8).subscribe({
      next: (res) => {
        this.propertyResults = res.items;
        this.cdr.markForCheck();
      },
    });
  }

  selectProperty(p: RealEstateWithStats): void {
    this.selectedProperty = p;
    this.propertySearch = '';
    this.propertyResults = [];
    this.cdr.markForCheck();
  }

  clearProperty(): void {
    this.selectedProperty = null;
    this.cdr.markForCheck();
  }

  propertyImage(p: RealEstateWithStats): string {
    return p.images?.[0] || 'assets/images/default-property.jpg';
  }

  // ── User ─────────────────────────────────────────────
  onUserSearch(): void {
    const q = this.userSearch.trim();
    if (!q) {
      this.userResults = [];
      this.cdr.markForCheck();
      return;
    }

    this.userService.getAllUsers({ name: q }, 1, 8).subscribe({
      next: (res) => {
        this.userResults = res.items;
        this.cdr.markForCheck();
      },
    });
  }

  selectUser(u: User): void {
    this.selectedUser = u;
    this.userSearch = '';
    this.userResults = [];
    this.cdr.markForCheck();
  }

  clearUser(): void {
    this.selectedUser = null;
    this.cdr.markForCheck();
  }

  userAvatar(u: User): string {
    return (
      u.image ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1e3a6e&color=f2cc6a&bold=true&size=64`
    );
  }

  // ── Validation ────────────────────────────────────────
  get canSubmit(): boolean {
    return !!(this.selectedProperty && this.selectedUser && this.amount && this.amount > 0);
  }

  // ── Submit ────────────────────────────────────────────
  submit(): void {
    if (!this.canSubmit || this.loading) return;

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    const dto: CreatePaymentDto = {
      amount: this.amount!,
      realEstateId: this.selectedProperty!.id,
      userId: this.selectedUser!.id,
    };

    this.paymentService.create(dto).subscribe({
      next: (created) => {
        this.paymentService.getById(created.id).subscribe({
          next: (full) => {
            this.loading = false;
            this.created.emit(full);
          },
          error: () => {
            this.loading = false;
            this.created.emit(created);
          },
        });
      },
      error: (err) => {
        this.loading = false;
        const raw = err?.error?.message ?? err?.message ?? '';
        this.error = Array.isArray(raw)
          ? raw.join(', ')
          : String(raw) || "Erreur lors de l'enregistrement.";
        this.cdr.markForCheck();
      },
    });
  }

  onOverlayClick(): void {
    if (!this.loading) this.close.emit();
  }
}
