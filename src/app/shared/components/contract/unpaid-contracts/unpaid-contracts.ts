import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from '../../../../core/models';

@Component({
  selector: 'app-unpaid-contracts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unpaid-contracts.html',
  styleUrls: ['./unpaid-contracts.css'],
})
export class UnpaidContracts {
  @Input() sale:    Contract[] = [];
  @Input() rental:  Contract[] = [];
  @Input() loading  = false;

  isOpen = true;

  get total(): number { return this.sale.length + this.rental.length; }

  toggle(): void { this.isOpen = !this.isOpen; }

  mainImage(c: Contract): string {
    return c.realEstate?.images?.[0] ?? 'assets/images/default-property.jpg';
  }
}