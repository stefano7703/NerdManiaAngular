import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { CarrelloService } from '../Service/CarrelloService';
import { UserDto } from '../Dto/UserDto';
import { OrdineService } from '../Service/ordineService';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { userService } from '../Service/userService';

// ================= TYPES =================

type CartItem = {
  productId: number;
  nome: string;
  immagineUrl?: string;
  quantity: number;
  unitPrice: number;
  unitWeight: number;
};

@Component({
  selector: 'app-carrello-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './carrello-component.html',
  styleUrl: './carrello-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarrelloComponent implements OnInit {
  private readonly carrelloService = inject(CarrelloService);
  private readonly ordineService = inject(OrdineService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userService = inject(userService);

  // State
  carrelli = signal<CarrelloDto[]>([]);
  selectedCarrelloId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  cartItems = signal<CartItem[]>([]);
  shippingAddress = signal('');
  orderPopupOpen = signal(false);
  orderPopupState = signal<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  orderPopupMessage = signal<string | null>(null);

  // Derived state
  selectedCarrello = computed(() => {
    const id = this.selectedCarrelloId();
    if (id === null) return null;
    return this.carrelli().find((c) => c.id === id) ?? null;
  });

  totalPrice = computed(() => {
    if (this.cartItems().length > 0) {
      const sum = this.cartItems().reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
      return Number(sum.toFixed(2));
    }
    return this.selectedCarrello()?.prezzoTotale ?? 0;
  });

  totalItems = computed(() => {
    if (this.cartItems().length > 0) {
      return this.cartItems().reduce((acc, item) => acc + item.quantity, 0);
      return this.cartItems().reduce((acc, item) => acc + item.quantity, 0);
    }
    return this.selectedCarrello()?.quantita ?? 0;
  });

  totalWeight = computed(() => {
    if (this.cartItems().length > 0) {
      const sum = this.cartItems().reduce((acc, item) => acc + item.quantity * item.unitWeight, 0);
      return Number(sum.toFixed(3));
    }
    return this.selectedCarrello()?.peso ?? 0;
  });

  // Tracking modifications
  modifyingIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadCurrentUserCart();
  }

  private getStoredUserId(): number | null {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as UserDto;
      const id = Number(parsed?.id);
      return isNaN(id) || id <= 0 ? null : id;
    } catch {
      return null;
    }
  }

  private cartIdStorageKey(userId: number): string {
    return `cartId:user:${userId}`;
  }

  private legacyCartItemsStorageKey(cartId: number): string {
    return `cart-items:${cartId}`;
  }

  private setCurrentCart(cart: CarrelloDto): void {
    this.carrelli.set([cart]);
    this.selectedCarrelloId.set(cart.id ?? null);
    this.loadCartItemsForCurrentCart(cart.id ?? null);
    const userId = this.getStoredUserId();
    if (cart.id) {
      localStorage.setItem('cartId', String(cart.id));
      if (userId) {
        localStorage.setItem(this.cartIdStorageKey(userId), String(cart.id));
      }
    }
    window.dispatchEvent(new CustomEvent('cart-items-changed'));
  }

  private cartItemsStorageKey(cartId: number, userId: number): string {
    return `cart-items:user:${userId}:${cartId}`;
  }

  private loadCartItemsForCurrentCart(cartId: number | null): void {
    const userId = this.getStoredUserId();
    if (!cartId || !userId) {
      this.cartItems.set([]);
      return;
    }

    let raw = localStorage.getItem(this.cartItemsStorageKey(cartId, userId));
    if (!raw) {
      raw = localStorage.getItem(this.legacyCartItemsStorageKey(cartId));
      if (raw) {
        localStorage.setItem(this.cartItemsStorageKey(cartId, userId), raw);
      }
    }

    if (!raw) {
      this.cartItems.set([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      this.cartItems.set(Array.isArray(parsed) ? parsed as CartItem[] : []);
    } catch {
      this.cartItems.set([]);
    }
  }

  private persistCartItems(cartId: number, items: CartItem[]): void {
    const userId = this.getStoredUserId();
    if (!userId) {
      this.cartItems.set(items);
      window.dispatchEvent(new CustomEvent('cart-items-changed'));
      return;
    }

    localStorage.setItem(this.cartItemsStorageKey(cartId, userId), JSON.stringify(items));
    this.cartItems.set(items);
    window.dispatchEvent(new CustomEvent('cart-items-changed'));
  }

  private syncCartTotalsFromItems(cart: CarrelloDto, items: CartItem[]): void {
    if (!cart.id) {
      return;
    }

    const quantita = items.reduce((acc, item) => acc + item.quantity, 0);
    const prezzoTotale = Number(items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0).toFixed(2));
    const peso = Number(items.reduce((acc, item) => acc + item.quantity * item.unitWeight, 0).toFixed(3));
    const userId = cart.userId ?? cart.user?.id ?? null;

    const updated = new CarrelloDto(prezzoTotale, quantita, peso, userId, cart.id);
    this.modifyingIds().add(cart.id);
    this.carrelloService.update(updated)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.carrelli.update((current) =>
            current.map((c) => c.id === cart.id ? { ...c, quantita, prezzoTotale, peso } : c)
          );
          this.modifyingIds().delete(cart.id!);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Errore aggiornamento carrello');
          this.modifyingIds().delete(cart.id!);
        },
      });
  }

  private createUserCart(userId: number, onDone: () => void): void {
    const payload = {
      prezzoTotale: 0,
      quantita: 0,
      peso: 0,
      userId,
    } as CarrelloDto;

    this.carrelloService.insert(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          const userRef = { id: userId } as UserDto;
          this.carrelloService.findByUser(userRef)
            .pipe(take(1))
            .subscribe({
              next: (createdCart) => {
                if (createdCart?.id) {
                  this.setCurrentCart(createdCart);
                }
                onDone();
              },
              error: () => {
                this.error.set('Carrello creato ma non recuperabile al momento');
                onDone();
              },
            });
        },
        error: () => {
          this.error.set('Errore creazione carrello');
          onDone();
        },
      });
  }

  private loadCurrentUserCart(): void {
    this.loading.set(true);
    this.error.set(null);

    const userId = this.getStoredUserId();
    if (!userId) {
      this.error.set('Devi effettuare il login per vedere il carrello');
      this.loading.set(false);
      return;
    }

    const userRef = { id: userId } as UserDto;
    this.carrelloService.findByUser(userRef)
      .pipe(take(1))
      .subscribe({
        next: (cart) => {
          if (cart?.id) {
            this.setCurrentCart(cart);
            this.loading.set(false);
            return;
          }
          this.createUserCart(userId, () => this.loading.set(false));
        },
        error: () => {
          this.createUserCart(userId, () => this.loading.set(false));
        },
      });
  }

  updateItemQuantita(productId: number, value: number): void {
    const carrello = this.selectedCarrello();
    if (!carrello?.id) {
      return;
    }

    const nextQty = Math.max(0, Math.trunc(value));
    const nextItems = this.cartItems()
      .map((item) => item.productId === productId ? { ...item, quantity: nextQty } : item)
      .filter((item) => item.quantity > 0);

    this.persistCartItems(carrello.id, nextItems);
    this.syncCartTotalsFromItems(carrello, nextItems);
  }

  removeItem(productId: number): void {
    const carrello = this.selectedCarrello();
    if (!carrello?.id) {
      return;
    }

    const nextItems = this.cartItems().filter((item) => item.productId !== productId);
    this.persistCartItems(carrello.id, nextItems);
    this.syncCartTotalsFromItems(carrello, nextItems);
  }

  removeFromCart(): void {
    const carrello = this.selectedCarrello();
    if (!carrello?.id) return;
    const carrelloId = carrello.id;
    const userId = this.getStoredUserId();
    if (!userId) {
      this.error.set('Utente non valido, effettua nuovamente il login');
      this.error.set('Utente non valido, effettua nuovamente il login');
      return;
    }

    this.modifyingIds().add(carrelloId);
    this.carrelloService.delete(carrelloId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          localStorage.removeItem('cartId');
          localStorage.removeItem(this.legacyCartItemsStorageKey(carrelloId));
          localStorage.removeItem(this.cartIdStorageKey(userId));
          localStorage.removeItem(this.cartItemsStorageKey(carrelloId, userId));
          window.dispatchEvent(new CustomEvent('cart-items-changed'));
          this.createUserCart(userId, () => {
            this.modifyingIds().delete(carrelloId);
          });
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Errore eliminazione');
          this.modifyingIds().delete(carrelloId);
        },
      });
  }

  isModifying(id: number | undefined): boolean {
    return id !== undefined && this.modifyingIds().has(id);
  }

  openOrderPopup(): void {
    this.orderPopupOpen.set(true);
    this.orderPopupState.set('confirm');
    this.orderPopupMessage.set(null);
  }

  closeOrderPopup(): void {
    if (this.orderPopupState() === 'loading') {
      return;
    }
    this.orderPopupOpen.set(false);
  }

  private expandProductsForOrder(items: CartItem[]): Array<{ id: number }> {
    const result: Array<{ id: number }> = [];

    for (const item of items) {
      const qty = Math.max(0, Math.trunc(item.quantity));
      for (let i = 0; i < qty; i += 1) {
        result.push({ id: item.productId });
      }
    }

    return result;
  }


  creaOrdine(): void {
    const carrello = this.selectedCarrello();
    const userId = this.getStoredUserId();
    const prodotti = this.expandProductsForOrder(this.cartItems())
      .map((p) =>
        new ProdottoDto(
          '', 0, 0, '', {} as any, 0, 0, false, 0, undefined, p.id,
        ),
      );

    this.orderPopupState.set('loading');
    this.orderPopupMessage.set(null);

    if (!carrello?.id || !userId) {
      this.orderPopupState.set('error');
      this.orderPopupMessage.set('Dati non validi per creare l\'ordine');
      return;
    }

    if (!this.shippingAddress().trim()) {
      this.orderPopupState.set('error');
      this.orderPopupMessage.set('Inserisci un indirizzo di spedizione');
      return;
    }

    const ordineDto = {
      costoTotale: this.totalPrice(),
      user: {
        id: userId,
      },
      indirizzoSpedizione: this.shippingAddress(),
      prodotti,
    };

    this.ordineService
      .insert(ordineDto as any)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.orderPopupState.set('success');
          this.orderPopupMessage.set('Ordine creato con successo!');

          this.shippingAddress.set('');

          if (carrello.id) {
            this.persistCartItems(carrello.id, []);
            this.syncCartTotalsFromItems(carrello, []);
          }

          this.userService
            .findById(userId)
            .pipe(take(1))
            .subscribe({
              next: (updatedUser) => {
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('user-updated'));
              },
            });
        },
        error: (err) => {
          this.orderPopupState.set('error');
          this.orderPopupMessage.set(err?.message ?? 'Errore creazione ordine');
        },
      });
  }
}
