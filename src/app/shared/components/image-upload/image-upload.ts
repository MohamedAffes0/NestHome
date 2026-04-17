import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
  styleUrls: ['./image-upload.css']
})
export class ImageUpload {
  @Input()  preview:  string | null = null;
  @Input()  accept:   string = 'image/*';
  @Input()  maxSize:  string = '5 Mo';
  @Input()  formats:  string = 'PNG, JPG';
  @Input()  inputId:  string = 'imageUpload';

  @Output() fileSelected = new EventEmitter<File>();
  @Output() cleared      = new EventEmitter<void>();

  selectedFile: File | null = null;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.preview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Clear the input value to allow re-selecting the same file if needed
    input.value = '';

    this.fileSelected.emit(file);
  }

  clear(): void {
    this.selectedFile = null;
    this.preview      = null;
    this.cleared.emit();
  }
}