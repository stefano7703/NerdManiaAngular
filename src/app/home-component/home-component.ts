import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { CategoriaDto } from '../Dto/CategoriaDto';
import { ProdottoService } from '../Service/ProdottoService';
import { categoriaService } from '../Service/categoriaService';

@Component({
  selector: 'app-home-component',
  imports: [RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly prodottoService = inject(ProdottoService);
  private readonly categoriaSrv = inject(categoriaService);

  welcomeTitle = 'NerdMania';
  welcomeMessage = 'Tutto nerd per tutti i nerd.';

  isDetailsOpen = signal(false);
  prodotti = signal<ProdottoDto[]>([]);
  categorie = signal<CategoriaDto[]>([]);
  isLoadingProdotti = signal(true);
  isLoadingCategorie = signal(true);
  prodottiError = signal<string | null>(null);
  categorieError = signal<string | null>(null);

  featuredProdotti = computed(() => this.prodotti().slice(0, 3));
  featuredCategorie = computed(() => this.categorie().slice(0, 4));

  ngOnInit(): void {
    this.loadProdotti();
    this.loadCategorie();
  }

  toggleDetails(): void {
    this.isDetailsOpen.update((value) => !value);
  }

  goToCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }

  prodottiCount(categoria: CategoriaDto): number {
    return categoria.prodotti?.length ?? 0;
  }

  private loadProdotti(): void {
    this.isLoadingProdotti.set(true);
    this.prodottiError.set(null);

    this.prodottoService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (items) => {
          this.prodotti.set(items ?? []);
          this.isLoadingProdotti.set(false);
        },
        error: () => {
          this.prodotti.set([]);
          this.prodottiError.set('Backend non raggiungibile o nessun prodotto disponibile.');
          this.isLoadingProdotti.set(false);
        },
      });
  }

  private loadCategorie(): void {
    this.isLoadingCategorie.set(true);
    this.categorieError.set(null);

    this.categoriaSrv
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (items) => {
          this.categorie.set(items ?? []);
          this.isLoadingCategorie.set(false);
        },
        error: () => {
          this.categorie.set([]);
          this.categorieError.set('Backend non raggiungibile o nessuna categoria disponibile.');
          this.isLoadingCategorie.set(false);
        },
      });
  }
}
