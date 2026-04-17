import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface MapLocation {
  lat:      number;
  lng:      number;
  label?:   string;
  address?: string;
}

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-map.html',
  styleUrls: ['./location-map.css']
})
export class LocationMap {
  @Input() location!: MapLocation;
  @Input() height: string = '280px';
  @Input() zoom:   number = 15;

  constructor(private sanitizer: DomSanitizer) {}

  get mapUrl(): SafeResourceUrl {
    const { lat, lng } = this.location;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Opens the location in Google Maps in a new tab
  openInMaps(): void {
    const { lat, lng } = this.location;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }
}