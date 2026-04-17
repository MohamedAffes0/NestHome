import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealEstateAgent } from '../../../../core/models';

@Component({
  selector: 'app-property-agent-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-agent-card.html',
  styleUrls: ['./property-agent-card.css']
})
export class PropertyAgentCard {
  @Input() agent!: RealEstateAgent;

  get avatarUrl(): string {
    return this.agent.image
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.agent.name)}&background=1e3a6e&color=f2cc6a&bold=true&size=80`;
  }
}