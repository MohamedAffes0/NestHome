import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-visual',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-visual.html',
  styleUrls: ['./auth-visual.css'],
})
export class AuthVisual {
  @Input() imageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80';
  @Input() quote  = '"Votre prochain chez-vous commence ici."';
}