import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../alert/alert';

export interface ReservationDto {
  clientPhone: string;
  cinPassport: string;
  visitDate:   string;  // YYYY-MM-DD
  visitTime:   string;  // HH:mm
}

@Component({
  selector: 'app-property-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './property-reservation.html',
  styleUrls: ['./property-reservation.css']
})
export class PropertyReservation {
  @Input()  propertyTitle = '';
  @Input()  isLoggedIn = false;
  @Input() infoMsg = '';
  @Output() submitted = new EventEmitter<ReservationDto>();

  form: ReservationDto = {
    clientPhone: '',
    cinPassport: '',
    visitDate:   '',
    visitTime:   '',
  };

  isLoading = false;
  success   = false;
  errorMsg  = '';

  // Date min = tomorrow
  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // Avaliable time slots (same for all days for simplicity)
  timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  onSubmit(): void {
    this.errorMsg = '';

    if (!this.form.clientPhone.trim()) { this.errorMsg = 'Le numéro de téléphone est obligatoire.'; return; }
    if (!this.form.cinPassport.trim()) { this.errorMsg = 'Le CIN / Passeport est obligatoire.'; return; }
    if (!this.form.visitDate)          { this.errorMsg = 'La date de visite est obligatoire.'; return; }
    if (!this.form.visitTime)          { this.errorMsg = "L'heure de visite est obligatoire."; return; }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.submitted.emit({ ...this.form });
  }

  /** Call in parent component after API call success */
  markSuccess(): void {
    this.isLoading = false;
    this.success   = true;
    this.form = { clientPhone: '', cinPassport: '', visitDate: '', visitTime: '' };
    this.cdr.detectChanges();
  }

  /** Call in parent component in case of API error */
  markError(msg: string): void {
    this.isLoading = false;
    this.errorMsg  = msg;
    this.cdr.detectChanges();
  }

  reset(): void {
    this.success = false;
    this.cdr.detectChanges();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}