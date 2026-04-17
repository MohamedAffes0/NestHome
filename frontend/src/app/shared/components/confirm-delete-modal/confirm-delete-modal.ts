import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-delete-modal.html',
  styleUrls: ['./confirm-delete-modal.css'],
})
export class ConfirmDeleteModal {
  @Input() title = 'Supprimer';
  @Input() message = 'Confirmer la suppression ?';
  @Input() confirmLabel = 'Supprimer';
  @Input() loading = false;

  @Output() close   = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onOverlayClick(): void {
    if (!this.loading) this.close.emit();
  }
}