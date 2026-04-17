import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-form-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-form-equipment.html',
  styleUrls: ['./property-form-equipment.css']
})
export class PropertyFormEquipment implements OnInit {

  @Input() initial: string[] = [];
  @Output() equipmentChange = new EventEmitter<string[]>();

  equipment: string[] = [];
  newItem = '';

  // Suggestions rapides
  readonly suggestions = [
    'Piscine', 'Garage', 'Climatisation', 'Jardin', 'Terrasse', 'Ascenseur',
    'Parking', 'Cave', 'Balcon', 'Cuisine équipée', 'Digicode', 'Interphone',
    'Fibre optique', 'Cheminée', 'Dressing', 'Buanderie',
  ];

  ngOnInit(): void {
    this.equipment = [...(this.initial ?? [])];
  }

  get availableSuggestions(): string[] {
    return this.suggestions.filter(s => !this.equipment.includes(s));
  }

  addSuggestion(item: string): void {
    if (!this.equipment.includes(item)) {
      this.equipment = [...this.equipment, item];
      this.emit();
    }
  }

  addCustom(): void {
    const trimmed = this.newItem.trim();
    if (trimmed && !this.equipment.includes(trimmed)) {
      this.equipment = [...this.equipment, trimmed];
      this.newItem = '';
      this.emit();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addCustom(); }
  }

  remove(item: string): void {
    this.equipment = this.equipment.filter(e => e !== item);
    this.emit();
  }

  private emit(): void {
    this.equipmentChange.emit([...this.equipment]);
  }
}
