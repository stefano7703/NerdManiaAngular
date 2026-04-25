import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CatalogoDto } from '../Dto/CatalogoDto';
import { CategoriaDto } from '../Dto/CategoriaDto';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { UserDto } from '../Dto/UserDto';
import { CatalogoService } from '../Service/CatalogoService';
import { ProdottoService } from '../Service/ProdottoService';
import { CarrelloService } from '../Service/CarrelloService';
import { WishlistService } from '../Service/WishlistService';

type ProdottoView = {
  prodotto: ProdottoDto;
  categoriaId: number;
  categoriaNome: string;
  catalogoId: number;
  catalogoNome: string;
};

type StoredCartItem = {
  productId: number;
  nome: string;
  immagineUrl?: string;
  quantity: number;
  unitPrice: number;
  unitWeight: number;
};

type SortOrder = 'none' | 'price-desc' | 'price-asc';

@Component({
  selector: 'app-catalogo-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogo-component.html',
  styleUrl: './catalogo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogoComponent implements OnInit {
  private readonly prodottoService = inject(ProdottoService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly carrelloService = inject(CarrelloService);
  readonly wishlistService = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);
  private readonly pageSize = 8;

  cataloghi = signal<CatalogoDto[]>([]);
  categorie = signal<CategoriaDto[]>([]);
  prodottiView = signal<ProdottoView[]>([]);

  selectedCatalogoId = signal<number | null>(null);
  selectedCategoriaId = signal<number | null>(null);
  nomeFilter = signal('');
  sortOrder = signal<SortOrder>('none');
  currentPage = signal(1);

  loading = signal(false);
  error = signal<string | null>(null);

  selectedProduct = signal<ProdottoDto | null>(null);
  addingToCart = signal(false);
  cartQuantity = signal(1);
  cartSuccess = signal<string | null>(null);

  categorieFiltrate = computed(() => {
    const catalogId = this.selectedCatalogoId();
    if (catalogId === null) {
      return this.categorie();
    }
    return this.categorie().filter((categoria) => categoria.catalogo?.id === catalogId);
  });

  prodottiFiltrati = computed(() => {
    const catalogId = this.selectedCatalogoId();
    const categoriaId = this.selectedCategoriaId();
    const nomeQuery = this.nomeFilter().trim().toLowerCase();
    const order = this.sortOrder();

    const filtered = this.prodottiView().filter((item) => {
      const matchCatalogo = catalogId === null || item.catalogoId === catalogId;
      const matchCategoria = categoriaId === null || item.categoriaId === categoriaId;
      const nome = (item.prodotto.nome ?? '').toLowerCase();
      const matchNome = nomeQuery.length === 0 || nome.includes(nomeQuery);
      return matchCatalogo && matchCategoria && matchNome;
    });

    if (order === 'none') {
      return filtered;
    }

    return [...filtered].sort((left, right) => {
      const priceDiff = left.prodotto.prezzo - right.prodotto.prezzo;
      return order === 'price-asc' ? priceDiff : -priceDiff;
    });
  });

  totalItems = computed(() => this.prodottiFiltrati().length);

  totalPages = computed(() => {
    const total = this.totalItems();
    if (total === 0) {
      return 0;
    }
    return Math.ceil(total / this.pageSize);
  });

  safeCurrentPage = computed(() => {
    const total = this.totalPages();
    if (total === 0) {
      return 1;
    }
    return Math.min(this.currentPage(), total);
  });

  prodottiPaginati = computed(() => {
    const items = this.prodottiFiltrati();
    if (items.length === 0) {
      return [];
    }

    const page = this.safeCurrentPage();
    const start = (page - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  visibleRangeStart = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }
    return (this.safeCurrentPage() - 1) * this.pageSize + 1;
  });

  visibleRangeEnd = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }
    return Math.min(this.safeCurrentPage() * this.pageSize, this.totalItems());
  });

  ngOnInit(): void {
    const catalogoIdParam = this.route.snapshot.queryParamMap.get('catalogoId');
    if (catalogoIdParam !== null) {
      const id = Number(catalogoIdParam);
      if (!isNaN(id)) {
        this.selectedCatalogoId.set(id);
      }
    }
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalogoService
      .findCataloghiConCategorie()
      .pipe(take(1))
      .subscribe({
        next: (cataloghiData) => {
          const cataloghiItems = Array.isArray(cataloghiData) ? cataloghiData : [];
          this.loadProdotti(cataloghiItems);
        },
        error: () => {
          this.catalogoService
            .getAll()
            .pipe(take(1))
            .subscribe({
              next: (fallbackCataloghiData) => {
                const fallbackCataloghi = Array.isArray(fallbackCataloghiData) ? fallbackCataloghiData : [];
                this.loadProdotti(fallbackCataloghi);
              },
              error: () => {
                this.loadProdotti([]);
              },
            });
        },
      });
  }

  private loadProdotti(cataloghiItems: CatalogoDto[]): void {
    const catalogoByCategoriaId = this.buildCatalogoByCategoriaId(cataloghiItems);
    const catalogoByCategoriaNome = this.buildCatalogoByCategoriaNome(cataloghiItems);
    this.prodottoService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (prodottiData) => {
          const prodottiItems = Array.isArray(prodottiData) ? prodottiData : [];
          this.prodottiView.set(this.flattenProdotti(prodottiItems, catalogoByCategoriaId, catalogoByCategoriaNome));
          this.categorie.set(this.extractCategorie(prodottiItems, catalogoByCategoriaId, catalogoByCategoriaNome));
          this.cataloghi.set(this.extractCataloghi(prodottiItems, catalogoByCategoriaId, catalogoByCategoriaNome));
          this.currentPage.set(1);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Errore caricamento prodotti');
          this.loading.set(false);
        },
      });
  }

  private flattenProdotti(
    prodottiItems: ProdottoDto[],
    catalogoByCategoriaId: Map<number, CatalogoDto>,
    catalogoByCategoriaNome: Map<string, CatalogoDto>
  ): ProdottoView[] {
    return prodottiItems.map((prodotto) => {
      const categoria = prodotto.categoria;
      const catalogo = this.resolveCatalogoForCategoria(categoria, catalogoByCategoriaId, catalogoByCategoriaNome);
      return {
        prodotto,
        categoriaId: categoria?.id ?? -1,
        categoriaNome: categoria?.nome ?? 'Categoria non assegnata',
        catalogoId: catalogo?.id ?? -1,
        catalogoNome: catalogo?.nome ?? 'Catalogo non assegnato',
      };
    });
  }

  private extractCategorie(
    prodottiItems: ProdottoDto[],
    catalogoByCategoriaId: Map<number, CatalogoDto>,
    catalogoByCategoriaNome: Map<string, CatalogoDto>
  ): CategoriaDto[] {
    const byId = new Map<number, CategoriaDto>();
    for (const prodotto of prodottiItems) {
      const categoria = prodotto.categoria;
      if (!categoria || categoria.id === undefined || categoria.id === null) {
        continue;
      }
      const categoriaWithCatalogo: CategoriaDto = {
        ...categoria,
        catalogo: this.resolveCatalogoForCategoria(categoria, catalogoByCategoriaId, catalogoByCategoriaNome) ?? categoria.catalogo,
      };
      if (!byId.has(categoria.id)) {
        byId.set(categoria.id, categoriaWithCatalogo);
      }
    }
    return Array.from(byId.values());
  }

  private extractCataloghi(
    prodottiItems: ProdottoDto[],
    catalogoByCategoriaId: Map<number, CatalogoDto>,
    catalogoByCategoriaNome: Map<string, CatalogoDto>
  ): CatalogoDto[] {
    const byId = new Map<number, CatalogoDto>();
    for (const prodotto of prodottiItems) {
      const catalogo = this.resolveCatalogoForCategoria(prodotto.categoria, catalogoByCategoriaId, catalogoByCategoriaNome);
      if (!catalogo || catalogo.id === undefined || catalogo.id === null) {
        continue;
      }
      if (!byId.has(catalogo.id)) {
        byId.set(catalogo.id, catalogo);
      }
    }
    return Array.from(byId.values());
  }

  private buildCatalogoByCategoriaId(cataloghiItems: CatalogoDto[]): Map<number, CatalogoDto> {
    const map = new Map<number, CatalogoDto>();
    for (const catalogo of cataloghiItems) {
      const categorie = this.getCategorieFromCatalogo(catalogo);
      for (const categoria of categorie) {
        if (categoria.id !== undefined && categoria.id !== null) {
          map.set(categoria.id, catalogo);
        }
      }
    }
    return map;
  }

  private buildCatalogoByCategoriaNome(cataloghiItems: CatalogoDto[]): Map<string, CatalogoDto> {
    const map = new Map<string, CatalogoDto>();
    for (const catalogo of cataloghiItems) {
      const categorie = this.getCategorieFromCatalogo(catalogo);
      for (const categoria of categorie) {
        const key = this.normalizeCategoriaKey(categoria.nome);
        if (key.length > 0 && !map.has(key)) {
          map.set(key, catalogo);
        }
      }
    }
    return map;
  }

  private resolveCatalogoForCategoria(
    categoria: CategoriaDto | undefined,
    catalogoByCategoriaId: Map<number, CatalogoDto>,
    catalogoByCategoriaNome: Map<string, CatalogoDto>
  ): CatalogoDto | undefined {
    if (!categoria) {
      return undefined;
    }

    if (categoria.catalogo?.id !== undefined && categoria.catalogo?.id !== null) {
      return categoria.catalogo;
    }

    if (categoria.id !== undefined && categoria.id !== null) {
      const byId = catalogoByCategoriaId.get(categoria.id);
      if (byId) {
        return byId;
      }
    }

    return catalogoByCategoriaNome.get(this.normalizeCategoriaKey(categoria.nome));
  }

  private normalizeCategoriaKey(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private getCategorieFromCatalogo(catalogo: CatalogoDto): CategoriaDto[] {
    type CatalogoWithLegacyCategoria = CatalogoDto & {
      categoria?: CategoriaDto | CategoriaDto[] | null;
    };

    if (Array.isArray(catalogo.categorie)) {
      return catalogo.categorie;
    }

    const legacy = catalogo as CatalogoWithLegacyCategoria;
    if (Array.isArray(legacy.categoria)) {
      return legacy.categoria;
    }
    if (legacy.categoria) {
      return [legacy.categoria];
    }

    return [];
  }

  onCatalogoChange(value: number | null): void {
    const nextCatalogo = value === null ? null : Number(value);
    this.selectedCatalogoId.set(nextCatalogo);
    this.currentPage.set(1);

    if (nextCatalogo === null) {
      return;
    }

    const categoriaId = this.selectedCategoriaId();
    if (categoriaId === null) {
      return;
    }

    const categoriaValida = this.categorie()
      .some((categoria) => categoria.id === categoriaId && categoria.catalogo?.id === nextCatalogo);

    if (!categoriaValida) {
      this.selectedCategoriaId.set(null);
    }
  }

  onCategoriaChange(value: number | null): void {
    this.selectedCategoriaId.set(value === null ? null : Number(value));
    this.currentPage.set(1);
  }

  onNomeFilterChange(value: string): void {
    this.nomeFilter.set(value ?? '');
    this.currentPage.set(1);
  }

  onSortOrderChange(value: SortOrder): void {
    if (value !== 'none' && value !== 'price-desc' && value !== 'price-asc') {
      this.sortOrder.set('none');
      this.currentPage.set(1);
      return;
    }
    this.sortOrder.set(value);
    this.currentPage.set(1);
  }

  resetFiltri(): void {
    this.selectedCatalogoId.set(null);
    this.selectedCategoriaId.set(null);
    this.nomeFilter.set('');
    this.sortOrder.set('none');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (total === 0) {
      this.currentPage.set(1);
      return;
    }

    const nextPage = Math.max(1, Math.min(page, total));
    this.currentPage.set(nextPage);
  }

  nextPage(): void {
    this.goToPage(this.safeCurrentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.safeCurrentPage() - 1);
  }

  openAddToCart(product: ProdottoDto): void {
    this.selectedProduct.set(product);
    this.cartQuantity.set(1);
  }

  onImageError(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }
    target.style.display = 'none';
  }

  toggleFavorite(event: Event, product: ProdottoDto): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleFavorite(product);
  }

  isFavorite(product: ProdottoDto): boolean {
    return this.wishlistService.isFavorite(product);
  }

  closeAddToCart(): void {
    this.selectedProduct.set(null);
    this.cartQuantity.set(1);
    this.cartSuccess.set(null);
  }

  private getStoredUser(): UserDto | null {
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
          localStorage.setItem('cartId', String(match.id));
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
    const cartIdStr = localStorage.getItem('cartId');
    if (cartIdStr) {
      const parsed = Number(cartIdStr);
      if (!isNaN(parsed) && parsed > 0) {
        onSuccess(parsed);
        return;
      }
    }

    const user = this.getStoredUser();
    if (!user?.id) {
      onFailure('Devi effettuare il login per aggiungere prodotti al carrello');
      return;
    }

    if (user.carrello?.id && user.carrello.id > 0) {
      localStorage.setItem('cartId', String(user.carrello.id));
      onSuccess(user.carrello.id);
      return;
    }

    this.carrelloService.findByUser(user).pipe(take(1)).subscribe({
      next: (cart) => {
        if (cart?.id !== undefined && cart.id !== null && cart.id > 0) {
          localStorage.setItem('cartId', String(cart.id));
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
              localStorage.setItem('cartId', String(savedCart.id));
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

  private cartItemsStorageKey(cartId: number): string {
    return `cart-items:${cartId}`;
  }

  private loadStoredCartItems(cartId: number): StoredCartItem[] {
    const raw = localStorage.getItem(this.cartItemsStorageKey(cartId));
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
    localStorage.setItem(this.cartItemsStorageKey(cartId), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-items-changed'));
  }

  private storeProductInCartItems(cartId: number, product: ProdottoDto, qty: number): void {
    const productId = Number(product.id);
    if (isNaN(productId) || productId <= 0) {
      return;
    }

    const items = this.loadStoredCartItems(cartId);
    const index = items.findIndex((item) => item.productId === productId);
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
            setTimeout(() => this.closeAddToCart(), 1500);
          },
          error: (err) => {
            this.addingToCart.set(false);
            this.error.set(err?.message ?? 'Errore aggiunta al carrello');
          },
        });
      },
      error: (err) => {
        const status = Number(err?.status ?? 0);
        if (allowRetry && (status === 403 || status === 404)) {
          localStorage.removeItem('cartId');
          this.resolveCartId(
            (newCartId) => this.addProductToCart(newCartId, product, qty, false),
            (message) => {
              this.addingToCart.set(false);
              this.error.set(message);
            }
          );
          return;
        }
        this.addingToCart.set(false);
        this.error.set(err?.message ?? 'Carrello non trovato. Effettua il login.');
      },
    });
  }

  confirmAddToCart(): void {
    const product = this.selectedProduct();
    const qty = this.cartQuantity();
    if (!product || qty < 1) return;
    this.addingToCart.set(true);
    this.cartSuccess.set(null);

    this.resolveCartId(
      (cartId) => this.addProductToCart(cartId, product, qty),
      (message) => {
        this.addingToCart.set(false);
        this.error.set(message);
      }
    );
  }

  decrementQuantity(): void {
    this.cartQuantity.set(Math.max(1, this.cartQuantity() - 1));
  }

  incrementQuantity(): void {
    this.cartQuantity.set(this.cartQuantity() + 1);
  }
}
