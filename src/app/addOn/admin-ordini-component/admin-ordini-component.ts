import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdineDto } from '../../Dto/OrdineDto';
import { OrdineService } from '../../Service/ordineService';

@Component({
  selector: 'app-admin-ordini-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ordini-component.html',
  styleUrl: './admin-ordini-component.css'
})
export class AdminOrdiniComponent implements OnInit {
  ordini = signal<OrdineDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ordineAperto = signal<number | null>(null);

  paginaOrdini = signal(1);
  ordiniPerPagina = signal(5);

  totalePagineOrdini = computed(() => {
    return Math.ceil(this.ordini().length / this.ordiniPerPagina()) || 1;
  });

  ordiniPaginati = computed(() => {
    const start = (this.paginaOrdini() - 1) * this.ordiniPerPagina();
    const end = start + this.ordiniPerPagina();
    return this.ordini().slice(start, end);
  });

  pagineOrdini = computed(() => {
    return Array.from(
      { length: this.totalePagineOrdini() },
      (_, index) => index + 1
    );
  });

  constructor(private ordineService: OrdineService) {}

  ngOnInit(): void {
    this.loadOrdini();
  }

  loadOrdini(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordineService.getAll().subscribe({
      next: (data: OrdineDto[]) => {
        this.ordini.set(data ?? []);
        this.paginaOrdini.set(1);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Errore caricamento ordini:', err);
        this.error.set('Errore durante il caricamento degli ordini.');
        this.loading.set(false);
      }
    });
  }

  toggleDettagliOrdine(id: number): void {
    this.ordineAperto.set(this.ordineAperto() === id ? null : id);
  }

  vaiPaginaOrdini(pagina: number): void {
    if (pagina < 1 || pagina > this.totalePagineOrdini()) {
      return;
    }

    this.paginaOrdini.set(pagina);
    this.ordineAperto.set(null);
  }

  paginaPrecedenteOrdini(): void {
    this.vaiPaginaOrdini(this.paginaOrdini() - 1);
  }

  paginaSuccessivaOrdini(): void {
    this.vaiPaginaOrdini(this.paginaOrdini() + 1);
  }

  cambiaOrdiniPerPagina(value: number): void {
    this.ordiniPerPagina.set(value);
    this.paginaOrdini.set(1);
    this.ordineAperto.set(null);
  }

  getProdottiConQuantita(prodotti: any[] = []): any[] {
    const map = new Map<number, any>();

    prodotti.forEach((prodotto) => {
      const id = prodotto.id;

      if (map.has(id)) {
        map.get(id).quantita++;
      } else {
        map.set(id, {
          ...prodotto,
          quantita: 1
        });
      }
    });

    return Array.from(map.values());
  }
}