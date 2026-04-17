import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../alert/alert';
import { ApiComment } from '../../../../core/models';

@Component({
  selector: 'app-property-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './property-comments.html',
  styleUrls: ['./property-comments.css']
})
export class PropertyComments {
  @Input()  comments:  ApiComment[] = [];
  @Input()  isLoggedIn = false;
  @Input() errorMsg   = '';
  @Output() submitted  = new EventEmitter<{ rating: number; content: string }>();

  form      = { rating: 0, content: '' };
  hovered   = 0;
  isLoading = false;

  stars = [1, 2, 3, 4, 5];

  constructor(private cdr: ChangeDetectorRef) {}

  get avgRating(): number {
    if (!this.comments.length) return 0;
    return this.comments.reduce((s, c) => s + c.rating, 0) / this.comments.length;
  }

  get ratingLabel(): string {
    const avg = this.avgRating;
    if (avg >= 4.5) return 'Excellent';
    if (avg >= 3.5) return 'Très bien';
    if (avg >= 2.5) return 'Bien';
    if (avg >= 1.5) return 'Passable';
    return 'Insuffisant';
  }

  starFill(star: number, rating: number): 'full' | 'empty' {
    return rating >= star ? 'full' : 'empty';
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (!this.form.rating)        { this.errorMsg = 'Veuillez choisir une note.'; return; }
    if (!this.form.content.trim()) { this.errorMsg = 'Le commentaire est obligatoire.'; return; }
    this.isLoading = true;
    this.cdr.detectChanges();
    this.submitted.emit({ rating: this.form.rating, content: this.form.content.trim() });
    this.form = { rating: 0, content: '' };
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a6e&color=f2cc6a&bold=true&size=64`;
  }
}