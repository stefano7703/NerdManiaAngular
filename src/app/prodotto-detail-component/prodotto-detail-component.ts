import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { UserDto } from '../Dto/UserDto';
import { CarrelloService } from '../Service/CarrelloService';
import { ProdottoService } from '../Service/ProdottoService';

type StoredCartItem = {
  productId: number;
  nome: string;
  immagineUrl?: string;
  quantity: number;
  unitPrice: number;
  unitWeight: number;
};

@Component({
  selector: 'app-prodotto-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto-detail-component.html',
  styleUrls: ['./prodotto-detail-component.css'],
})
export class ProdottoDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly prodottoService = inject(ProdottoService);
  private readonly carrelloService = inject(CarrelloService);
  private readonly isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  prodotto = signal<ProdottoDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  quantita = signal(1);
  addingToCart = signal(false);
  cartError = signal<string | null>(null);
  cartSuccess = signal<string | null>(null);
  private routeSubscription?: Subscription;

  private cartIdStorageKey(userId: number): string {
    return `cartId:user:${userId}`;
  }

  private persistCartIdForUser(userId: number, cartId: number): void {
    localStorage.setItem(this.cartIdStorageKey(userId), String(cartId));
    localStorage.setItem('cartId', String(cartId));
  }

  private readCartIdForUser(userId: number): number | null {
    const value = localStorage.getItem(this.cartIdStorageKey(userId));
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const id = Number(idParam);

      this.quantita.set(1);
      this.cartError.set(null);
      this.cartSuccess.set(null);

      if (!idParam || isNaN(id) || id <= 0) {
        this.prodotto.set(null);
        this.error.set('ID prodotto non valido.');
        this.loading.set(false);
        return;
      }

      this.loadProduct(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.prodottoService.findById(id).pipe(take(1)).subscribe({
      next: (item) => {
        this.prodotto.set(item);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento prodotto:', err);
        this.prodotto.set(null);
        this.error.set('Impossibile caricare il prodotto.');
        this.loading.set(false);
      }
    });
  }

  incrementQuantity(): void {
    this.quantita.update(q => q + 1);
  }

  decrementQuantity(): void {
    this.quantita.update(q => (q > 1 ? q - 1 : 1));
  }

  onImageError(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }
    target.style.display = 'none';
  }

  goBack(): void {
    this.router.navigate(['/catalogo']);
  }

  addToCart(): void {
    const item = this.prodotto();
    const qty = this.quantita();
    if (!item || qty < 1) {
      return;
    }

    this.addingToCart.set(true);
    this.cartError.set(null);
    this.cartSuccess.set(null);

    this.resolveCartId(
      (cartId) => this.addProductToCart(cartId, item, qty),
      (message) => {
        this.addingToCart.set(false);
        this.cartError.set(message);
      }
    );
  }

  private getStoredUser(): UserDto | null {
    if (!this.isBrowser) {
      return null;
    }

    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      return null;
    }
  }

  private resolveCartFromActive(
    userId: number,
    onFound: (cartId: number) => void,
    onMissing: () => void
  ): void {
    this.carrelloService.findCarrelliAttivi().pipe(take(1)).subscribe({
      next: (items) => {
        const match = (items ?? []).find((cart) => (cart.userId ?? cart.user?.id) === userId && (cart.id ?? 0) > 0);
        if (match?.id) {
          if (this.isBrowser) {
            this.persistCartIdForUser(userId, match.id);
          }
          onFound(match.id);
          return;
        }
        onMissing();
      },
      error: () => {
        onMissing();
      },
    });
  }

  private resolveCartId(onSuccess: (cartId: number) => void, onFailure: (message: string) => void): void {
    if (!this.isBrowser) {
      onFailure('Funzione disponibile solo nel browser');
      return;
    }

    const user = this.getStoredUser();
    if (!user?.id) {
      onFailure('Devi effettuare il login per aggiungere prodotti al carrello');
      return;
    }

    const storedCartId = this.readCartIdForUser(user.id);
    if (storedCartId) {
      onSuccess(storedCartId);
      return;
    }

    if (user.carrello?.id && user.carrello.id > 0) {
      this.persistCartIdForUser(user.id, user.carrello.id);
      onSuccess(user.carrello.id);
      return;
    }

    this.carrelloService.findByUser(user).pipe(take(1)).subscribe({
      next: (cart) => {
        if (cart?.id !== undefined && cart.id !== null && cart.id > 0) {
          this.persistCartIdForUser(user.id!, cart.id);
          onSuccess(cart.id);
          return;
        }
        this.resolveCartFromActive(user.id!, onSuccess, () => this.createCartForUser(user, onSuccess, onFailure));
      },
      error: () => {
        this.resolveCartFromActive(user.id!, onSuccess, () => this.createCartForUser(user, onSuccess, onFailure));
      },
    });
  }

  private createCartForUser(
    user: UserDto,
    onSuccess: (cartId: number) => void,
    onFailure: (message: string) => void
  ): void {
    const userRef = { id: user.id } as UserDto;
    const newCart = {
      prezzoTotale: 0,
      quantita: 0,
      peso: 0,
      userId: userRef.id,
    } as CarrelloDto;

    this.carrelloService.insert(newCart).pipe(take(1)).subscribe({
      next: () => {
        this.carrelloService.findByUser(userRef).pipe(take(1)).subscribe({
          next: (savedCart: CarrelloDto) => {
            if (savedCart?.id !== undefined && savedCart.id !== null && savedCart.id > 0) {
              if (this.isBrowser) {
                this.persistCartIdForUser(user.id!, savedCart.id);
              }
              onSuccess(savedCart.id);
              return;
            }

            this.resolveCartFromActive(userRef.id!, onSuccess, () => {
              onFailure('Impossibile creare il carrello per questo utente');
            });
          },
          error: () => {
            this.resolveCartFromActive(userRef.id!, onSuccess, () => {
              onFailure('Impossibile creare il carrello per questo utente');
            });
          },
        });
      },
      error: () => {
        onFailure('Impossibile creare il carrello per questo utente');
      },
    });
  }

  private cartItemsStorageKey(cartId: number, userId: number): string {
    return `cart-items:user:${userId}:${cartId}`;
  }

  private legacyCartItemsStorageKey(cartId: number): string {
    return `cart-items:${cartId}`;
  }

  private loadStoredCartItems(cartId: number): StoredCartItem[] {
    if (!this.isBrowser) {
      return [];
    }

    const userId = this.getStoredUser()?.id;
    if (!userId) {
      return [];
    }

    let raw = localStorage.getItem(this.cartItemsStorageKey(cartId, userId));
    if (!raw) {
      raw = localStorage.getItem(this.legacyCartItemsStorageKey(cartId));
      if (raw) {
        localStorage.setItem(this.cartItemsStorageKey(cartId, userId), raw);
      }
    }

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as StoredCartItem[] : [];
    } catch {
      return [];
    }
  }

  private saveStoredCartItems(cartId: number, items: StoredCartItem[]): void {
    if (!this.isBrowser) {
      return;
    }

    const userId = this.getStoredUser()?.id;
    if (!userId) {
      return;
    }

    localStorage.setItem(this.cartItemsStorageKey(cartId, userId), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-items-changed'));
  }

  private storeProductInCartItems(cartId: number, product: ProdottoDto, qty: number): void {
    const productId = Number(product.id);
    if (isNaN(productId) || productId <= 0) {
      return;
    }

    const items = this.loadStoredCartItems(cartId);
    const index = items.findIndex((storedItem) => storedItem.productId === productId);
    if (index >= 0) {
      const existing = items[index];
      items[index] = {
        ...existing,
        quantity: existing.quantity + qty,
        unitPrice: product.prezzo,
        unitWeight: product.peso ?? 0,
        immagineUrl: product.immagineUrl,
      };
      this.saveStoredCartItems(cartId, items);
      return;
    }

    items.push({
      productId,
      nome: product.nome,
      immagineUrl: product.immagineUrl,
      quantity: qty,
      unitPrice: product.prezzo,
      unitWeight: product.peso ?? 0,
    });
    this.saveStoredCartItems(cartId, items);
  }

  private addProductToCart(cartId: number, product: ProdottoDto, qty: number, allowRetry = true): void {
    this.carrelloService.read(cartId).pipe(take(1)).subscribe({
      next: (cart) => {
        const fallbackUserId = this.getStoredUser()?.id ?? null;
        const userId = cart.userId ?? cart.user?.id ?? fallbackUserId;
        const updated = new CarrelloDto(
          cart.prezzoTotale + product.prezzo * qty,
          cart.quantita + qty,
          cart.peso + (product.peso ?? 0) * qty,
          userId,
          cart.id,
        );

        this.carrelloService.update(updated).pipe(take(1)).subscribe({
          next: () => {
            this.storeProductInCartItems(cartId, product, qty);
            this.addingToCart.set(false);
            this.cartSuccess.set(`${qty} × "${product.nome}" aggiunto al carrello`);
          },
          error: (err) => {
            this.addingToCart.set(false);
            this.cartError.set(err?.message ?? 'Errore aggiunta al carrello');
          },
        });
      },
      error: (err) => {
        const status = Number(err?.status ?? 0);
        if (allowRetry && (status === 403 || status === 404)) {
          if (this.isBrowser) {
            const userId = this.getStoredUser()?.id;
            if (userId) {
              localStorage.removeItem(this.cartIdStorageKey(userId));
            }
            localStorage.removeItem('cartId');
          }
          this.resolveCartId(
            (newCartId) => this.addProductToCart(newCartId, product, qty, false),
            (message) => {
              this.addingToCart.set(false);
              this.cartError.set(message);
            }
          );
          return;
        }

        this.addingToCart.set(false);
        this.cartError.set(err?.message ?? 'Carrello non trovato. Effettua il login.');
      },
    });
  }
}