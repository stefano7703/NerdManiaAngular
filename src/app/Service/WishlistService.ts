import { Injectable, Inject, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProdottoDto } from '../Dto/ProdottoDto';

export type FavoriteItem = {
  id: number;
  nome: string;
  prezzo: number;
  immagineUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storageKeyPrefix = 'favorite-items';
  private readonly legacyStorageKey = 'favorite-items';
  private readonly isBrowser: boolean;
  private currentStorageKey = '';

  readonly favorites = signal<FavoriteItem[]>([]);
  readonly favoriteCount = computed(() => this.favorites().length);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.currentStorageKey = this.resolveStorageKey();
      this.favorites.set(this.loadFromStorage(this.currentStorageKey));
    }
  }

  isFavorite(product: ProdottoDto | FavoriteItem): boolean {
    this.syncWithActiveStorageKey();

    const productId = Number(product?.id);
    if (isNaN(productId) || productId <= 0) {
      return false;
    }

    return this.favorites().some((item) => item.id === productId);
  }

  toggleFavorite(product: ProdottoDto): void {
    this.syncWithActiveStorageKey();

    const productId = Number(product?.id);
    if (isNaN(productId) || productId <= 0) {
      return;
    }

    const current = this.favorites();
    if (current.some((item) => item.id === productId)) {
      this.setFavorites(current.filter((item) => item.id !== productId));
      return;
    }

    const nextItem: FavoriteItem = {
      id: productId,
      nome: product.nome,
      prezzo: product.prezzo,
      immagineUrl: product.immagineUrl,
    };

    this.setFavorites([...current, nextItem]);
  }

  removeFavorite(productId: number): void {
    this.syncWithActiveStorageKey();

    const normalizedId = Number(productId);
    if (isNaN(normalizedId) || normalizedId <= 0) {
      return;
    }

    this.setFavorites(this.favorites().filter((item) => item.id !== normalizedId));
  }

  refreshForActiveUser(): void {
    this.syncWithActiveStorageKey();
  }

  private setFavorites(items: FavoriteItem[]): void {
    this.favorites.set(items);
    if (this.isBrowser) {
      localStorage.setItem(this.currentStorageKey, JSON.stringify(items));
    }
  }

  private loadFromStorage(storageKey: string): FavoriteItem[] {
    const raw = localStorage.getItem(storageKey) ?? this.readLegacyStorageValue(storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) => ({
          id: Number(item?.id),
          nome: String(item?.nome ?? ''),
          prezzo: Number(item?.prezzo ?? 0),
          immagineUrl: item?.immagineUrl ? String(item.immagineUrl) : undefined,
        }))
        .filter((item) => !isNaN(item.id) && item.id > 0);
    } catch {
      return [];
    }
  }

  private readLegacyStorageValue(storageKey: string): string | null {
    if (storageKey === this.legacyStorageKey) {
      return null;
    }

    const legacyRaw = localStorage.getItem(this.legacyStorageKey);
    if (!legacyRaw) {
      return null;
    }

    localStorage.setItem(storageKey, legacyRaw);
    return legacyRaw;
  }

  private syncWithActiveStorageKey(): void {
    if (!this.isBrowser) {
      return;
    }

    const nextKey = this.resolveStorageKey();
    if (nextKey === this.currentStorageKey) {
      return;
    }

    this.currentStorageKey = nextKey;
    this.favorites.set(this.loadFromStorage(nextKey));
  }

  private resolveStorageKey(): string {
    const userId = this.getCurrentUserId();
    if (userId === null) {
      return `${this.storageKeyPrefix}:guest`;
    }
    return `${this.storageKeyPrefix}:user:${userId}`;
  }

  private getCurrentUserId(): number | null {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as { id?: number | string };
      const numericId = Number(parsed?.id);
      if (isNaN(numericId) || numericId <= 0) {
        return null;
      }
      return numericId;
    } catch {
      return null;
    }
  }
}
