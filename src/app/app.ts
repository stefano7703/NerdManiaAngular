import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AsyncPipe, CommonModule, NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './Service/AuthService';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('NerdManiaAngular');
  cartItemCount = signal(0);
  private readonly cartChangedListener = () => this.refreshCartItemCount();
  private routerSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.refreshCartItemCount();
    window.addEventListener('cart-items-changed', this.cartChangedListener);
    window.addEventListener('storage', this.cartChangedListener);
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.refreshCartItemCount();
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('cart-items-changed', this.cartChangedListener);
    window.removeEventListener('storage', this.cartChangedListener);
    this.routerSubscription?.unsubscribe();
  }

  private refreshCartItemCount(): void {
    if (!this.authService.isLoggedIn()) {
      this.cartItemCount.set(0);
      return;
    }

    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      this.cartItemCount.set(0);
      return;
    }

    const raw = localStorage.getItem(`cart-items:${cartId}`);
    if (!raw) {
      this.cartItemCount.set(0);
      return;
    }

    try {
      const items = JSON.parse(raw);
      const count = Array.isArray(items)
        ? items.reduce((sum: number, item: { quantity?: number }) => sum + Math.max(0, Number(item?.quantity ?? 0)), 0)
        : 0;
      this.cartItemCount.set(count);
    } catch {
      this.cartItemCount.set(0);
    }
  }

  logout() {
    this.authService.logout();
    this.cartItemCount.set(0);
  }

}
