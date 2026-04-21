import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  welcomeTitle = 'NerdMania';
  welcomeMessage =
    'Tutto nerd per tutti i nerd.';

  isDetailsOpen = signal(false); // Stato per la tendina

  constructor(private router: Router) {}

  toggleDetails(): void {
    this.isDetailsOpen.update((value) => !value);
  }

  goToContacts(): void {
    this.router.navigate(['/contact']);
  }
}
