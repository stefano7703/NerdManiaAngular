import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { userService } from '../Service/userService';
import { AuthService } from '../Service/AuthService';
import { UserDto } from '../Dto/UserDto';
import { CarrelloDto } from '../Dto/CarrelloDto';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  user = signal<UserDto>(
    new UserDto(0, '', '', '', '', '', '', false, new CarrelloDto(0, 0, 0), null)
  );

  ordineAperto: number | null = null;

  // 🔥 QUI STA LA CHIAVE PER NON BLOCCARE
  prodottiPerOrdine = new Map<number, any[]>();

  constructor(
    private service: userService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('user-updated', () => this.loadUser());
    }
  }

  private loadUser(): void {
    const loggedUser = this.authService.getUser();

    if (loggedUser) {
      this.user.set(loggedUser);
      this.preparaProdottiOrdini(loggedUser);
    }
  }

  // 🔥 PRECALCOLO (evita loop infinito)
  private preparaProdottiOrdini(user: UserDto): void {
    this.prodottiPerOrdine.clear();

    user.ordini?.forEach((ordine: any) => {
      this.prodottiPerOrdine.set(
        ordine.id,
        this.getProdottiConQuantita(ordine.prodotti || [])
      );
    });
  }

  private getProdottiConQuantita(prodotti: any[]): any[] {
    const map = new Map<number, any>();

    prodotti.forEach((p) => {
      if (map.has(p.id)) {
        map.get(p.id).quantita++;
      } else {
        map.set(p.id, { ...p, quantita: 1 });
      }
    });

    return Array.from(map.values());
  }

  toggleSpedizione(id: number): void {
    this.ordineAperto = this.ordineAperto === id ? null : id;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    return this.authService.isLoggedIn();
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}