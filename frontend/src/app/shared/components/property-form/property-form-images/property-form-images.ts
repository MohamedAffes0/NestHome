import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from "../../alert/alert";

export interface ImageItem {
  type: 'existing' | 'new';
  url:   string;
  file?: File;
}

const MAX_PHOTOS = 10;

@Component({
  selector: 'app-property-form-images',
  standalone: true,
  imports: [CommonModule, Alert],
  templateUrl: './property-form-images.html',
  styleUrls: ['./property-form-images.css']
})
export class PropertyFormImages implements OnInit {

  @Input() existingImages: string[] = [];
  @Output() imagesChange = new EventEmitter<{ toKeep: string[]; newFiles: File[] }>();

  items:    ImageItem[] = [];
  dragOver  = false;
  limitMsg  = '';

  readonly maxPhotos = MAX_PHOTOS;

  ngOnInit(): void {
    this.items = (this.existingImages ?? []).map(url => ({ type: 'existing', url }));
    this.emit();
  }

  // ── Drag & Drop ────────────────────────────────────────
  onDragOver(e: DragEvent): void { e.preventDefault(); this.dragOver = true; }
  onDragLeave(): void { this.dragOver = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    this.addFiles(files);
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files);
    input.value = '';
  }

  private addFiles(files: File[]): void {
    this.limitMsg = '';
    const remaining = MAX_PHOTOS - this.items.length;

    if (remaining <= 0) {
      this.limitMsg = `Maximum ${MAX_PHOTOS} photos atteint.`;
      return;
    }

    const toAdd = files.slice(0, remaining);

    if (files.length > remaining) {
      this.limitMsg = `Limite de ${MAX_PHOTOS} photos : ${files.length - remaining} fichier(s) ignoré(s).`;
    }

    const newItems = toAdd.map(f => ({
      type: 'new' as const,
      url:  URL.createObjectURL(f),
      file: f,
    }));

    this.items = [...this.items, ...newItems];
    this.emit();
  }

  remove(index: number): void {
    const item = this.items[index];
    if (item.type === 'new' && item.url) URL.revokeObjectURL(item.url);
    this.items = this.items.filter((_, i) => i !== index);
    this.limitMsg = '';
    this.emit();
  }

  // Drag to reorder
  dragIndex: number | null = null;

  onItemDragStart(i: number): void { this.dragIndex = i; }

  onItemDrop(targetIndex: number): void {
    if (this.dragIndex === null || this.dragIndex === targetIndex) return;
    const arr = [...this.items];
    const [moved] = arr.splice(this.dragIndex, 1);
    arr.splice(targetIndex, 0, moved);
    this.items = arr;
    this.dragIndex = null;
    this.emit();
  }

  get canAddMore(): boolean { return this.items.length < MAX_PHOTOS; }

  private emit(): void {
    this.imagesChange.emit({
      toKeep:   this.items.filter(i => i.type === 'existing').map(i => i.url),
      newFiles: this.items.filter(i => i.type === 'new' && i.file).map(i => i.file!),
    });
  }
}