import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class Pagination implements OnChanges {
  @Input() currentPage  = 1;
  @Input() totalPages   = 1;
  @Input() totalItems   = 0;
  @Input() itemsPerPage = 10;
  @Input() delta        = 2; // Visible page range around current page

  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.buildPages();
  }

  private buildPages(): void {
    const left  = Math.max(1, this.currentPage - this.delta);
    const right = Math.min(this.totalPages, this.currentPage + this.delta);
    this.pages  = Array.from({ length: right - left + 1 }, (_, i) => left + i);
  }

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  get showFirstEllipsis(): boolean { return this.pages[0] > 2; }
  get showLastEllipsis():  boolean { return this.pages[this.pages.length - 1] < this.totalPages - 1; }
  get showFirst():         boolean { return this.pages[0] > 1; }
  get showLast():          boolean { return this.pages[this.pages.length - 1] < this.totalPages; }

  get from(): number { return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.totalItems); }
  get to():   number { return Math.min(this.currentPage * this.itemsPerPage, this.totalItems); }
}