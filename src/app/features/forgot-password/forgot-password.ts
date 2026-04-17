import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Alert } from "../../shared/components/alert/alert";
import { AuthVisual } from '../../shared/components/auth-visual/auth-visual';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Alert, AuthVisual],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {
  email = '';
  isLoading = false;
  sent = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      this.errorMsg = 'Veuillez entrer une adresse e-mail valide.';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.requestPasswordReset(this.email.trim())
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.sent = true;
          this.cdr.detectChanges();
        },
        error: () => {
          // Always show sent state for security (prevent email enumeration)
          this.isLoading = false;
          this.sent = true;
          this.cdr.detectChanges();
        },
      });
  }
}