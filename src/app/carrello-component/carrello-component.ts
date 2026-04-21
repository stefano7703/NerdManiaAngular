import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { CarrelloService } from '../Service/CarrelloService';

@Component({
  selector: 'app-carrello-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './carrello-component.html',
  styleUrl: './carrello-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarrelloComponent implements OnInit {
  private readonly carrelloService = inject(CarrelloService);

  // State
  carrelli = signal<CarrelloDto[]>([]);
  selectedCarrelloId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Derived state
  selectedCarrello = computed(() => {
    const id = this.selectedCarrelloId();
    if (id === null) return null;
    return this.carrelli().find(c => c.id === id) ?? null;
  });

  totalPrice = computed(() => 
    this.selectedCarrello()?.prezzoTotale ?? 0
  );
  totalItems = computed(() =>
    this.selectedCarrello()?.quantita ?? 0
  );

  // Tracking modifications
  modifyingIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadCarrelli();
  }

  private loadCarrelli(): void {
    this.loading.set(true);
    this.error.set(null);
    this.carrelloService.findCarrelliAttivi()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          console.log('[Carrello DEBUG]', data);
          const items = Array.isArray(data) ? data : [];
          this.carrelli.set(items);
          // Auto-select first cart if available
          if (items.length > 0) {
            this.selectedCarrelloId.set(items[0].id ?? null);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Errore caricamento carrello');
          this.loading.set(false);
        },
      });
  }

  selectCarrello(id: number | undefined): void {
    if (id !== undefined) {
      this.selectedCarrelloId.set(id);
    }
  }

  onCarrelloSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id = Number(target.value);
    this.selectCarrello(isNaN(id) ? undefined : id);
  }

  updateQuantita(newQuantita: number): void {
    const carrello = this.selectedCarrello();
    if (!carrello || !carrello.id || newQuantita < 0) return;

    this.modifyingIds().add(carrello.id);
    const updated = new CarrelloDto(
      carrello.prezzoTotale ?? 0,
      newQuantita,
      carrello.peso ?? 0,
      carrello.user ?? null,
      carrello.ordine ?? null,
      carrello.id
    );

    this.carrelloService.update(updated)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.carrelli.update(items =>
            items.map(c => c.id === carrello.id ? { ...c, quantita: newQuantita } : c)
          );
          this.modifyingIds().delete(carrello.id);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Errore aggiornamento');
          this.modifyingIds().delete(carrello.id);
        },
      });
  }

  removeFromCart(): void {
    const carrello = this.selectedCarrello();
    if (!carrello?.id) return;

    this.modifyingIds().add(carrello.id);
    this.carrelloService.delete(carrello.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.carrelli.update(items => items.filter(c => c.id !== carrello.id));
          // Auto-select next cart or null
          const remaining = this.carrelli().filter(c => c.id !== carrello.id);
          this.selectedCarrelloId.set(remaining.length > 0 ? remaining[0].id ?? null : null);
          this.modifyingIds().delete(carrello.id);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Errore eliminazione');
          this.modifyingIds().delete(carrello.id);
        },
      });
  }

  isModifying(id: number | undefined): boolean {
    return id !== undefined && this.modifyingIds().has(id);
  }
}
