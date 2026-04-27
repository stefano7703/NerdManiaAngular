import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { MagazzinoDto } from '../../Dto/MagazzinoDto';
import { MagazzinoService } from '../../Service/MagazzinoService';

@Component({
  selector: 'app-admin-magazzino',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-magazzino-component.html',
  styleUrls: ['./admin-magazzino-component.css']
})
export class AdminMagazzinoComponent implements OnInit {
  private readonly magazzinoService = inject(MagazzinoService);

  magazzini = signal<MagazzinoDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  searchTerm = signal('');
  movimentoQuantita = signal(1);

  isEditMode = signal(false);
  selectedMagazzinoId = signal<number | null>(null);

  formModel = signal<MagazzinoDto>(this.createEmptyMagazzino());

  magazziniFiltrati = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.magazzini();
    }

    return this.magazzini().filter((m) =>
      m.nome?.toLowerCase().includes(term) ||
      m.indirizzo?.toLowerCase().includes(term) ||
      m.codice?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadMagazzini();
  }

  private createEmptyMagazzino(): MagazzinoDto {
    return {
  nome: '',
  indirizzo: '',
  codice: '',
  quantita: 0
} as MagazzinoDto;
  }

  loadMagazzini(): void {
    this.loading.set(true);
    this.error.set(null);

    this.magazzinoService.getAll().pipe(take(1)).subscribe({
      next: (items) => {
        this.magazzini.set(items ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento magazzini admin:', err);
        this.error.set('Impossibile caricare i magazzini.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  newMagazzino(): void {
    this.isEditMode.set(false);
    this.selectedMagazzinoId.set(null);
    this.success.set(null);
    this.error.set(null);
    this.formModel.set(this.createEmptyMagazzino());
  }

  editMagazzino(magazzino: MagazzinoDto): void {
    this.isEditMode.set(true);
    this.selectedMagazzinoId.set(magazzino.id ?? null);
    this.success.set(null);
    this.error.set(null);

    this.formModel.set({
  ...magazzino
});

    
  }

  deleteMagazzino(id?: number): void {
    if (!id) {
      return;
    }

    const confirmed = confirm('Vuoi davvero eliminare questo magazzino?');

    if (!confirmed) {
      return;
    }

    this.error.set(null);
    this.success.set(null);

    this.magazzinoService.delete(id).pipe(take(1)).subscribe({
      next: () => {
        this.success.set('Magazzino eliminato con successo.');
        this.loadMagazzini();

        if (this.selectedMagazzinoId() === id) {
          this.newMagazzino();
        }
      },
      error: (err) => {
        console.error('Errore eliminazione magazzino:', err);
        this.error.set('Errore durante l’eliminazione del magazzino.');
      }
    });
  }

  submitForm(): void {
    const model = this.formModel();

    if (!model.nome?.trim()) {
      this.error.set('Il nome del magazzino è obbligatorio.');
      return;
    }

    if (!model.indirizzo?.trim()) {
      this.error.set('L’indirizzo del magazzino è obbligatorio.');
      return;
    }

    if (!model.codice?.trim()) {
      this.error.set('Il codice del magazzino è obbligatorio.');
      return;
    }

    if (model.quantita < 0) {
      this.error.set('La quantità non può essere negativa.');
      return;
    }

    this.error.set(null);
    this.success.set(null);
    this.saving.set(true);

    const request$ = this.isEditMode() && this.selectedMagazzinoId()
      ? this.magazzinoService.update(model)
      : this.magazzinoService.create(model);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.success.set(
          this.isEditMode()
            ? 'Magazzino aggiornato con successo.'
            : 'Magazzino creato con successo.'
        );

        this.saving.set(false);
        this.loadMagazzini();
        this.newMagazzino();
      },
      error: (err) => {
        console.error('Errore salvataggio magazzino:', err);
        this.error.set('Errore durante il salvataggio del magazzino.');
        this.saving.set(false);
      }
    });
  }

  aumentaQuantita(magazzino: MagazzinoDto): void {
    const quantita = this.movimentoQuantita();

    if (quantita <= 0) {
      this.error.set('Inserisci una quantità maggiore di zero.');
      return;
    }

    const updated: MagazzinoDto = {
      ...magazzino,
      quantita: magazzino.quantita + quantita
    };

    this.magazzinoService.update(updated).pipe(take(1)).subscribe({
      next: () => {
        this.success.set('Quantità aumentata con successo.');
        this.error.set(null);
        this.loadMagazzini();
      },
      error: (err) => {
        console.error('Errore aumento quantità:', err);
        this.error.set('Errore durante l’aumento della quantità.');
      }
    });
  }

  diminuisciQuantita(magazzino: MagazzinoDto): void {
    const quantita = this.movimentoQuantita();

    if (quantita <= 0) {
      this.error.set('Inserisci una quantità maggiore di zero.');
      return;
    }

    if (magazzino.quantita - quantita < 0) {
      this.error.set('La quantità non può diventare negativa.');
      return;
    }

    const updated: MagazzinoDto = {
      ...magazzino,
      quantita: magazzino.quantita - quantita
    };

    this.magazzinoService.update(updated).pipe(take(1)).subscribe({
      next: () => {
        this.success.set('Quantità diminuita con successo.');
        this.error.set(null);
        this.loadMagazzini();
      },
      error: (err) => {
        console.error('Errore diminuzione quantità:', err);
        this.error.set('Errore durante la diminuzione della quantità.');
      }
    });
  }

  updateField<K extends keyof MagazzinoDto>(field: K, value: MagazzinoDto[K]): void {
    this.formModel.update((current) => ({
      ...current,
      [field]: value
    }));
  }
  /*
  updateProdottiId(value: string): void {
    const ids = value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item) && item > 0);

    this.formModel.update((current) => ({
      ...current,
      prodottiId: ids
    }));
  }
  */
  clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}