import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alert } from '../../shared/components/alert/alert';
import { AuthVisual } from '../../shared/components/auth-visual/auth-visual';
import { PasswordStrength } from '../../shared/components/password-strength/password-strength';
import { PasswordRequirements } from '../../shared/components/password-requirements/password-requirements';
import { AuthService } from '../../core/services';

type ResetState = 'form' | 'loading' | 'success' | 'invalid';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Alert, AuthVisual, PasswordStrength, PasswordRequirements],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  token = '';
  state: ResetState = 'form';

  form = { password: '', confirm: '' };
  showPassword = false;
  showConfirm  = false;

  errorMsg  = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.token =
      this.route.snapshot.paramMap.get('token') ??
      this.route.snapshot.queryParamMap.get('token') ??
      '';

    if (!this.token) {
      this.state = 'invalid';
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    this.errorMsg = '';

    if (!this.form.password) {
      this.errorMsg = 'Le mot de passe est obligatoire.';
      return;
    }
    if (this.form.password.length < 8) {
      this.errorMsg = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (this.form.password !== this.form.confirm) {
      this.errorMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.resetPassword(this.token, this.form.password)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.state = 'success';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/login']), 3500);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message ?? '';
          if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
            this.state = 'invalid';
          } else {
            this.errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
          }
          this.cdr.detectChanges();
        },
      });
  }
}