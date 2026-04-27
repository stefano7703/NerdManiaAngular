import { Component, OnDestroy, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './Service/AuthService';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { WishlistService } from './Service/WishlistService';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('NerdManiaAngular');
  cartItemCount = signal(0);
  isFavoritesPopupOpen = signal(false);
  wishlistService: WishlistService;

  private readonly cartChangedListener = () => this.refreshCartItemCount();
  private routerSubscription?: Subscription;
  private readonly isBrowser: boolean | undefined;

  constructor(
    public authService: AuthService,
    wishlistService: WishlistService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.wishlistService = wishlistService;
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ---------------- INIT ----------------
  ngOnInit(): void {
    if (!this.isBrowser) {
      this.cartItemCount.set(0);
      return;
    }

    this.wishlistService.refreshForActiveUser();
    this.refreshCartItemCount();

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('cart-items-changed', this.cartChangedListener);
      window.addEventListener('storage', this.cartChangedListener);
    }

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.wishlistService.refreshForActiveUser();
        this.refreshCartItemCount();
      }
    });
  }

  // ---------------- DESTROY ----------------
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('cart-items-changed', this.cartChangedListener);
      window.removeEventListener('storage', this.cartChangedListener);
    }

    this.routerSubscription?.unsubscribe();
  }

  // ---------------- CART COUNT ----------------
  private refreshCartItemCount(): void {
    if (!this.isBrowser) {
      this.cartItemCount.set(0);
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.cartItemCount.set(0);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.authService.getUser();
    const userId = Number(user?.id);
    if (isNaN(userId) || userId <= 0) {
      this.cartItemCount.set(0);
      return;
    }

    const scopedCartId = localStorage.getItem(`cartId:user:${userId}`);
    if (scopedCartId) {
      localStorage.setItem('cartId', scopedCartId);
    }

    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      this.cartItemCount.set(0);
      return;
    }

    const parsedCartId = Number(cartId);
    if (isNaN(parsedCartId) || parsedCartId <= 0) {
      this.cartItemCount.set(0);
      return;
    }

    let raw = localStorage.getItem(`cart-items:user:${userId}:${parsedCartId}`);
    if (!raw) {
      raw = localStorage.getItem(`cart-items:${parsedCartId}`);
      if (raw) {
        localStorage.setItem(`cart-items:user:${userId}:${parsedCartId}`, raw);
      }
    }

    if (!raw) {
      this.cartItemCount.set(0);
      return;
    }

    try {
      const items = JSON.parse(raw);

      const count = Array.isArray(items)
        ? items.reduce(
            (sum: number, item: { quantity?: number }) =>
              sum + Math.max(0, Number(item?.quantity ?? 0)),
            0
          )
        : 0;

      this.cartItemCount.set(count);
    } catch {
      this.cartItemCount.set(0);
    }
  }

  // ---------------- LOGOUT ----------------
  logout(): void {
    this.authService.logout();
    this.wishlistService.refreshForActiveUser();
    this.cartItemCount.set(0);
    this.isFavoritesPopupOpen.set(false);
  }

  openFavoritesPopup(): void {
    if (this.wishlistService.favoriteCount() <= 0) {
      return;
    }
    this.isFavoritesPopupOpen.set(true);
  }

  closeFavoritesPopup(): void {
    this.isFavoritesPopupOpen.set(false);
  }

  openFavoriteProduct(productId: number): void {
    const normalizedId = Number(productId);
    if (isNaN(normalizedId) || normalizedId <= 0) {
      return;
    }

    this.closeFavoritesPopup();
    this.router.navigate(['/prodotto', normalizedId]);
  }

  removeFavorite(productId: number): void {
    this.wishlistService.removeFavorite(productId);
  }
}
