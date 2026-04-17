import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealEstate, RealEstateType } from '../../../../core/models';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetails {
  @Input() property!: RealEstate;

  typeLabel: Record<RealEstateType, string> = {
    [RealEstateType.HOUSE]:      'Maison',
    [RealEstateType.APARTMENT]: 'Appartement',
    [RealEstateType.LAND]:     'Terrain',
    [RealEstateType.BUSINESS]:    'Commerce',
  };

  statusLabel: Record<number, string> = {
    0: 'À Vendre',
    1: 'À Louer',
    2: 'Vendu',
    3: 'Loué'
  };
}