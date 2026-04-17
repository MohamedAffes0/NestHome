import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-strength.html',
  styleUrls: ['./password-strength.css']
})
export class PasswordStrength {
  @Input() password: string = '';

  get strength(): number {
    const p = this.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  }

  get label(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.strength] ?? '';
  }

  get cls(): string {
    return ['', 'weak', 'fair', 'good', 'strong'][this.strength] ?? '';
  }

  get bars(): number[] {
    return [1, 2, 3, 4];
  }
}