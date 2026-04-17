import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services';
import { Alert } from '../../shared/components/alert/alert';
import { AuthVisual } from '../../shared/components/auth-visual/auth-visual';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Alert, AuthVisual],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  form = {
    email:    '',
    password: '',
    remember: false,
  };

  showPassword = false;
  isLoading    = false;
  errorMessage = '';

  // Toggle password visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if form is valid
  isFormValid(): boolean {
    return !!(
      this.form.email.trim() &&
      this.isValidEmail(this.form.email) &&
      this.form.password.trim() &&
      this.form.password.length >= 8
    );
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.showError('Veuillez remplir tous les champs correctement.');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const result = await this.authService.login(
        this.form.email,
        this.form.password
      );

      if (result && 'user' in result && result.user) {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/']);
        return;
      }

      this.showError('Identifiants invalides. Veuillez réessayer.');
      this.isLoading = false;
      this.cdr.detectChanges();

    } catch (error: any) {
      this.showError(error?.message || 'Une erreur est survenue. Veuillez réessayer.');
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 2000);
    this.cdr.detectChanges();
  }

  async onGoogleSignIn(): Promise<void> {
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle('/login');
    } catch {
      this.showError('Impossible de continuer avec Google. Veuillez reessayer.');
    }
  }
}
