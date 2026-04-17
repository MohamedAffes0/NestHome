import { Component } from '@angular/core';
import { Alert } from "../../shared/components/alert/alert";
import { RouterLink } from '@angular/router';
import { AuthVisual } from '../../shared/components/auth-visual/auth-visual';

@Component({
  selector: 'app-check-email',
  imports: [Alert, RouterLink, AuthVisual],
  templateUrl: './check-email.html',
  styleUrl: './check-email.css',
})
export class CheckEmail {

}
