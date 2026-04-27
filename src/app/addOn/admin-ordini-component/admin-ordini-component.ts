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

  filtroUsername = signal('');
  filtroIndirizzo = signal('');
  filtroCostoMaggiore = signal<number | null>(null);
  filtroCostoMinore = signal<number | null>(null);
  filtroProdottoId = signal<number | null>(null);

  filtroAttivo = signal('Tutti gli ordini');

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
        this.filtroAttivo.set('Tutti gli ordini');
        this.resetPaginazione();
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Errore caricamento ordini:', err);
        this.error.set('Errore durante il caricamento degli ordini.');
        this.loading.set(false);
      }
    });
  }

  filtraPerUsername(): void {
    const username = this.filtroUsername().trim();

    if (!username) {
      this.error.set('Inserisci uno username da cercare.');
      return;
    }

    this.eseguiFiltro(
      this.ordineService.findByUserUsername(username),
      `Username: ${username}`
    );
  }

  filtraPerIndirizzo(): void {
    const indirizzo = this.filtroIndirizzo().trim();

    if (!indirizzo) {
      this.error.set('Inserisci un indirizzo da cercare.');
      return;
    }

    this.eseguiFiltro(
      this.ordineService.findByIndirizzoSpedizioneContainingIgnoreCase(indirizzo),
      `Indirizzo: ${indirizzo}`
    );
  }

  filtraCostoMaggiore(): void {
    const prezzo = this.filtroCostoMaggiore();

    if (prezzo === null || prezzo < 0) {
      this.error.set('Inserisci un costo valido.');
      return;
    }

    this.eseguiFiltro(
      this.ordineService.findByCostoTotaleGreaterThan(prezzo),
      `Costo maggiore di €${prezzo}`
    );
  }

  filtraCostoMinore(): void {
    const prezzo = this.filtroCostoMinore();

    if (prezzo === null || prezzo < 0) {
      this.error.set('Inserisci un costo valido.');
      return;
    }

    this.eseguiFiltro(
      this.ordineService.findByCostoTotaleLessThan(prezzo),
      `Costo minore di €${prezzo}`
    );
  }

  filtraPerProdottoId(): void {
    const prodottoId = this.filtroProdottoId();

    if (prodottoId === null || prodottoId <= 0) {
      this.error.set('Inserisci un ID prodotto valido.');
      return;
    }

    this.eseguiFiltro(
      this.ordineService.findByProdottiId(prodottoId),
      `ID prodotto: ${prodottoId}`
    );
  }

  ordinaCostoCrescente(): void {
    this.eseguiFiltro(
      this.ordineService.findAllByOrderByCostoTotaleAsc(),
      'Totale crescente'
    );
  }

  ordinaCostoDecrescente(): void {
    this.eseguiFiltro(
      this.ordineService.findAllByOrderByCostoTotaleDesc(),
      'Totale decrescente'
    );
  }

  resetFiltri(): void {
    this.filtroUsername.set('');
    this.filtroIndirizzo.set('');
    this.filtroCostoMaggiore.set(null);
    this.filtroCostoMinore.set(null);
    this.filtroProdottoId.set(null);
    this.loadOrdini();
  }

  private eseguiFiltro(request$: any, label: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.ordineAperto.set(null);

    request$.subscribe({
      next: (data: OrdineDto[]) => {
        this.ordini.set(data ?? []);
        this.filtroAttivo.set(label);
        this.resetPaginazione();
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Errore filtro ordini:', err);
        this.error.set('Errore durante il filtro degli ordini.');
        this.loading.set(false);
      }
    });
  }

  private resetPaginazione(): void {
    this.paginaOrdini.set(1);
    this.ordineAperto.set(null);
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
    this.resetPaginazione();
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