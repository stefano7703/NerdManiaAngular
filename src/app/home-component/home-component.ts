import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { CatalogoDto } from '../Dto/CatalogoDto';
import { CategoriaDto } from '../Dto/CategoriaDto';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { AuthService } from '../Service/AuthService';
import { CatalogoService } from '../Service/CatalogoService';
import { ProdottoService } from '../Service/ProdottoService';
import { WishlistService } from '../Service/WishlistService';

type CatalogoGroup = {
  catalogoKey: string;
  catalogoId: number | null;
  catalogoNome: string;
  prodotti: ProdottoDto[];
};

type CatalogoHighlight = {
  catalogoKey: string;
  catalogoId: number | null;
  catalogoNome: string;
  prodotto: ProdottoDto;
};

@Component({
  selector: 'app-home-component',
  imports: [RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);
  private readonly prodottoService = inject(ProdottoService);
  private readonly catalogoService = inject(CatalogoService);
  private rotationTimer: ReturnType<typeof setInterval> | null = null;

  welcomeTitle = 'NerdMania';
  welcomeMessage = 'Tutto nerd per tutti i nerd.';

  isDetailsOpen = signal(false);
  prodotti = signal<ProdottoDto[]>([]);
  catalogoByCategoriaId = signal<Map<number, CatalogoDto>>(new Map());
  catalogoByCategoriaNome = signal<Map<string, CatalogoDto>>(new Map());
  catalogRotationIndexes = signal<Record<string, number>>({});
  isLoadingProdotti = signal(true);
  prodottiError = signal<string | null>(null);

  featuredProdotti = computed(() => this.prodotti().slice(0, 3));

  catalogoGroups = computed<CatalogoGroup[]>(() => {
    const grouped = new Map<string, CatalogoGroup>();
    const catalogoById = this.catalogoByCategoriaId();
    const catalogoByNome = this.catalogoByCategoriaNome();

    for (const prodotto of this.prodotti()) {
      const catalogo = this.resolveCatalogoForCategoria(prodotto.categoria, catalogoById, catalogoByNome);
      const catalogoNome = catalogo?.nome?.trim();
      if (!catalogo || !catalogoNome) {
        continue;
      }

      const catalogoKey =
        catalogo.id !== undefined && catalogo.id !== null
          ? `catalogo-${catalogo.id}`
          : `catalogo-${catalogoNome.toLowerCase()}`;

      const existing = grouped.get(catalogoKey);
      if (existing) {
        existing.prodotti.push(prodotto);
        continue;
      }

      grouped.set(catalogoKey, {
        catalogoKey,
        catalogoId: catalogo.id ?? null,
        catalogoNome,
        prodotti: [prodotto],
      });
    }

    return Array.from(grouped.values());
  });

  catalogoHighlights = computed<CatalogoHighlight[]>(() => {
    const rotationIndexes = this.catalogRotationIndexes();

    return this.catalogoGroups().map((group) => {
      const index = this.normalizeIndex(rotationIndexes[group.catalogoKey], group.prodotti.length);
      return {
        catalogoKey: group.catalogoKey,
        catalogoId: group.catalogoId,
        catalogoNome: group.catalogoNome,
        prodotto: group.prodotti[index],
      };
    });
  });

  ngOnInit(): void {
    this.loadData();
    this.startCatalogRotation();
  }

  ngOnDestroy(): void {
    this.stopCatalogRotation();
  }

  toggleDetails(): void {
    this.isDetailsOpen.update((value) => !value);
  }

  goToCatalogo(): void {
    this.router.navigate(['/catalogo']);
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

  private loadData(): void {
    this.isLoadingProdotti.set(true);
    this.prodottiError.set(null);

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
              next: (cataloghiFallbackData) => {
                const cataloghiItems = Array.isArray(cataloghiFallbackData) ? cataloghiFallbackData : [];
                this.loadProdotti(cataloghiItems);
              },
              error: () => {
                this.loadProdotti([]);
              },
            });
        },
      });
  }

  private loadProdotti(cataloghiItems: CatalogoDto[]): void {
    this.catalogoByCategoriaId.set(this.buildCatalogoByCategoriaId(cataloghiItems));
    this.catalogoByCategoriaNome.set(this.buildCatalogoByCategoriaNome(cataloghiItems));

    this.prodottoService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (items) => {
          this.prodotti.set(items ?? []);
          this.initializeCatalogRotationIndexes();
          this.isLoadingProdotti.set(false);
        },
        error: () => {
          this.prodotti.set([]);
          this.catalogRotationIndexes.set({});
          this.prodottiError.set('Backend non raggiungibile o nessun prodotto disponibile.');
          this.isLoadingProdotti.set(false);
        },
      });
  }

  private startCatalogRotation(): void {
    this.stopCatalogRotation();
    this.rotationTimer = setInterval(() => {
      this.rotateCatalogProducts();
    }, 4000);
  }

  private stopCatalogRotation(): void {
    if (this.rotationTimer !== null) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }

  private initializeCatalogRotationIndexes(): void {
    this.catalogRotationIndexes.set({});
    this.rotateCatalogProducts();
  }

  private rotateCatalogProducts(): void {
    const groups = this.catalogoGroups();
    if (groups.length === 0) {
      return;
    }

    this.catalogRotationIndexes.update((current) => {
      const next: Record<string, number> = { ...current };

      for (const group of groups) {
        const length = group.prodotti.length;
        if (length <= 1) {
          next[group.catalogoKey] = 0;
          continue;
        }

        const currentIndex = this.normalizeIndex(current[group.catalogoKey], length);
        let randomIndex = Math.floor(Math.random() * length);
        while (randomIndex === currentIndex) {
          randomIndex = Math.floor(Math.random() * length);
        }
        next[group.catalogoKey] = randomIndex;
      }

      return next;
    });
  }

  private normalizeIndex(value: number | undefined, length: number): number {
    if (length <= 0) {
      return 0;
    }
    if (value === undefined || value === null || value < 0 || value >= length) {
      return 0;
    }
    return value;
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
}
