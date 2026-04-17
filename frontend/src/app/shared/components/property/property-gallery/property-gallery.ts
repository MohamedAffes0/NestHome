import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-gallery.html',
  styleUrls: ['./property-gallery.css']
})
export class PropertyGallery {
  @Input() images: string[] = [];
  @Input() title:  string   = '';

  current = 0;
  lightbox = false;

  prev(e?: Event): void { e?.stopPropagation(); this.current = (this.current - 1 + this.images.length) % this.images.length; }
  next(e?: Event): void { e?.stopPropagation(); this.current = (this.current + 1) % this.images.length; }

  // Open lightbox and prevent background scrolling
  open():  void { this.lightbox = true;  document.body.style.overflow = 'hidden'; }
  // Close lightbox and restore background scrolling
  close(): void { this.lightbox = false; document.body.style.overflow = ''; }

  // Keyboard navigation for lightbox
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.lightbox) return;
    if (e.key === 'ArrowLeft')  this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'Escape')     this.close();
  }
}