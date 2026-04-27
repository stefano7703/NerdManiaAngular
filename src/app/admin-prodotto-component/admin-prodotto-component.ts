import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { CategoriaDto } from '../Dto/CategoriaDto';
import { ProdottoService } from '../Service/ProdottoService';

@Component({
  selector: 'app-admin-prodotto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-prodotto-component.html',
  styleUrls: ['./admin-prodotto-component.css']
})
export class AdminProdottoComponent implements OnInit {
  private readonly prodottoService = inject(ProdottoService);
  private readonly pageSize = 5;

  prodotti = signal<ProdottoDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  searchTerm = signal('');
  currentPage = signal(1);

  isEditMode = signal(false);
  selectedProductId = signal<number | null>(null);

  formModel = signal<ProdottoDto>(this.createEmptyProduct());

  prodottiFiltrati = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.prodotti();
    }

    return this.prodotti().filter((p) =>
      p.nome?.toLowerCase().includes(term) ||
      p.descrizione?.toLowerCase().includes(term) ||
      p.categoria?.nome?.toLowerCase().includes(term)
    );
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
    this.loadProdotti();
  }

  private createEmptyProduct(): ProdottoDto {
  return new ProdottoDto(
    '',
    0,
    0,
    '',
    {
      id: 0,
      nome: '',
      catalogo: undefined as any,
      prodotti: []
    } as CategoriaDto,
    0,
    0,
    false,
    0,
    '',
    undefined
  );
}

  loadProdotti(): void {
    this.loading.set(true);
    this.error.set(null);

    this.prodottoService.getAll().pipe(take(1)).subscribe({
      next: (items) => {
        this.prodotti.set(items ?? []);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento prodotti admin:', err);
        this.error.set('Impossibile caricare i prodotti.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  previousPage(): void {
    const current = this.safeCurrentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
    }
  }

  nextPage(): void {
    const current = this.safeCurrentPage();
    const total = this.totalPages();
    if (current < total) {
      this.currentPage.set(current + 1);
    }
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  newProduct(): void {
    this.isEditMode.set(false);
    this.selectedProductId.set(null);
    this.success.set(null);
    this.error.set(null);
    this.formModel.set(this.createEmptyProduct());
  }

  editProduct(product: ProdottoDto): void {
    this.isEditMode.set(true);
    this.selectedProductId.set(product.id ?? null);
    this.success.set(null);
    this.error.set(null);

    this.formModel.set({
      ...product,
      categoria: product.categoria
        ? { ...product.categoria }
        : ({ id: 0, nome: '', catalogo: undefined as any, prodotti: [] } as CategoriaDto)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(id?: number): void {
    if (!id) {
      return;
    }

    const confirmed = confirm('Vuoi davvero eliminare questo prodotto?');
    if (!confirmed) {
      return;
    }

    this.error.set(null);
    this.success.set(null);

    this.prodottoService.delete(id).pipe(take(1)).subscribe({
      next: () => {
        this.success.set('Prodotto eliminato con successo.');
        this.loadProdotti();

        if (this.selectedProductId() === id) {
          this.newProduct();
        }
      },
      error: (err) => {
        console.error('Errore eliminazione prodotto:', err);
        this.error.set('Errore durante l’eliminazione del prodotto.');
      }
    });
  }

  submitForm(): void {
    const model = this.formModel();

    if (!model.nome?.trim()) {
      this.error.set('Il nome del prodotto è obbligatorio.');
      return;
    }

    if (!model.descrizione?.trim()) {
      this.error.set('La descrizione del prodotto è obbligatoria.');
      return;
    }

    if (!model.categoria || !model.categoria.id) {
      this.error.set('L’ID categoria è obbligatorio.');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.saving.set(true);

    const request$ = this.isEditMode()
      ? this.prodottoService.update(model)
      : this.prodottoService.insert(model);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.success.set(this.isEditMode()
          ? 'Prodotto aggiornato con successo.'
          : 'Prodotto creato con successo.'
        );
        this.saving.set(false);
        this.loadProdotti();
        this.newProduct();
      },
      error: (err) => {
        console.error('Errore salvataggio prodotto:', err);
        this.error.set('Errore durante il salvataggio del prodotto.');
        this.saving.set(false);
      }
    });
  }

  updateField<K extends keyof ProdottoDto>(field: K, value: ProdottoDto[K]): void {
    this.formModel.update((current) => ({
      ...current,
      [field]: value
    }));
  }

  updateCategoriaId(value: number): void {
    this.formModel.update((current) => ({
      ...current,
      categoria: {
        ...current.categoria,
        id: value
      } as CategoriaDto
    }));
  }

  clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}