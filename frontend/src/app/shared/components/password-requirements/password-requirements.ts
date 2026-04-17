import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-requirements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-requirements.html',
  styleUrls: ['./password-requirements.css'],
})
export class PasswordRequirements {
  @Input() password = '';

  get hasMinLength(): boolean { return this.password.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.password); }
  get hasDigit(): boolean { return /[0-9]/.test(this.password); }
}