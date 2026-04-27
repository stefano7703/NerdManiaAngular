import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SpedizioneDto } from '../../Dto/SpedizioneDto';
import { spedizioneService } from '../../Service/spedizioneService';

@Component({
  selector: 'app-admin-spedizioni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-spedizioni-component.html',
  styleUrl: './admin-spedizioni-component.css'
})
export class AdminSpedizioniComponent implements OnInit {
  spedizioni = signal<SpedizioneDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  spedizioneAperta = signal<number | null>(null);

  filtroAttivo = signal('Tutte le spedizioni');

  filtroPesoMaggiore = signal<number | null>(null);
  filtroPesoMinore = signal<number | null>(null);
  filtroAltezzaMin = signal<number | null>(null);
  filtroAltezzaMax = signal<number | null>(null);
  filtroOrdineId = signal<number | null>(null);
  filtroAltezzaMaggiore = signal<number | null>(null);
  filtroLunghezzaMaggiore = signal<number | null>(null);

  paginaSpedizioni = signal(1);
  spedizioniPerPagina = signal(5);

  totalePagineSpedizioni = computed(() => {
    return Math.ceil(this.spedizioni().length / this.spedizioniPerPagina()) || 1;
  });

  spedizioniPaginate = computed(() => {
    const start = (this.paginaSpedizioni() - 1) * this.spedizioniPerPagina();
    const end = start + this.spedizioniPerPagina();
    return this.spedizioni().slice(start, end);
  });

  pagineSpedizioni = computed(() => {
    return Array.from(
      { length: this.totalePagineSpedizioni() },
      (_, index) => index + 1
    );
  });

  constructor(private service: spedizioneService) {}

  ngOnInit(): void {
    this.loadSpedizioni();
  }

  loadSpedizioni(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll().subscribe({
      next: (data: SpedizioneDto[]) => {
        this.spedizioni.set(data ?? []);
        this.filtroAttivo.set('Tutte le spedizioni');
        this.resetPaginazione();
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Errore caricamento spedizioni:', err);
        this.error.set('Errore durante il caricamento delle spedizioni.');
        this.loading.set(false);
      }
    });
  }

  filtraFragili(): void {
    this.eseguiFiltro(
      this.service.findByFragileTrue(),
      'Solo spedizioni fragili'
    );
  }

  filtraPesoMaggiore(): void {
    const peso = this.filtroPesoMaggiore();

    if (peso === null || peso < 0) {
      this.error.set('Inserisci un peso valido.');
      return;
    }

    this.eseguiFiltro(
      this.service.findByPesoGreaterThan(peso),
      `Peso maggiore di ${peso} kg`
    );
  }

  filtraPesoMinore(): void {
    const peso = this.filtroPesoMinore();

    if (peso === null || peso < 0) {
      this.error.set('Inserisci un peso valido.');
      return;
    }

    this.eseguiFiltro(
      this.service.findByPesoLessThan(peso),
      `Peso minore di ${peso} kg`
    );
  }

  filtraAltezzaBetween(): void {
    const min = this.filtroAltezzaMin();
    const max = this.filtroAltezzaMax();

    if (min === null || max === null || min < 0 || max < 0 || min > max) {
      this.error.set('Inserisci un intervallo altezza valido.');
      return;
    }

    this.eseguiFiltro(
      this.service.findByAltezzaBetween(min, max),
      `Altezza tra ${min} e ${max} cm`
    );
  }

  filtraOrdineId(): void {
    const id = this.filtroOrdineId();

    if (id === null || id <= 0) {
      this.error.set('Inserisci un ID ordine valido.');
      return;
    }

    this.eseguiFiltro(
      this.service.findByOrdineId(id),
      `ID ordine: ${id}`
    );
  }

  filtraDimensioniGrandi(): void {
    const h = this.filtroAltezzaMaggiore();
    const l = this.filtroLunghezzaMaggiore();

    if (h === null || l === null || h < 0 || l < 0) {
      this.error.set('Inserisci altezza e lunghezza valide.');
      return;
    }

    this.eseguiFiltro(
      this.service.findByAltezzaGreaterThanOrLunghezzaGreaterThan(h, l),
      `Altezza > ${h} cm oppure lunghezza > ${l} cm`
    );
  }

  resetFiltri(): void {
    this.filtroPesoMaggiore.set(null);
    this.filtroPesoMinore.set(null);
    this.filtroAltezzaMin.set(null);
    this.filtroAltezzaMax.set(null);
    this.filtroOrdineId.set(null);
    this.filtroAltezzaMaggiore.set(null);
    this.filtroLunghezzaMaggiore.set(null);
    this.loadSpedizioni();
  }

  private eseguiFiltro(request$: any, label: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.spedizioneAperta.set(null);

    request$.subscribe({
      next: (data: SpedizioneDto[]) => {
        this.spedizioni.set(data ?? []);
        this.filtroAttivo.set(label);
        this.resetPaginazione();
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Errore filtro spedizioni:', err);
        this.error.set('Errore durante il filtro delle spedizioni.');
        this.loading.set(false);
      }
    });
  }

  toggleDettagliSpedizione(id: number): void {
    this.spedizioneAperta.set(this.spedizioneAperta() === id ? null : id);
  }

  cambiaSpedizioniPerPagina(value: number): void {
    this.spedizioniPerPagina.set(value);
    this.resetPaginazione();
  }

  vaiPaginaSpedizioni(pagina: number): void {
    if (pagina < 1 || pagina > this.totalePagineSpedizioni()) {
      return;
    }

    this.paginaSpedizioni.set(pagina);
    this.spedizioneAperta.set(null);
  }

  paginaPrecedenteSpedizioni(): void {
    this.vaiPaginaSpedizioni(this.paginaSpedizioni() - 1);
  }

  paginaSuccessivaSpedizioni(): void {
    this.vaiPaginaSpedizioni(this.paginaSpedizioni() + 1);
  }

  private resetPaginazione(): void {
    this.paginaSpedizioni.set(1);
    this.spedizioneAperta.set(null);
  }
}