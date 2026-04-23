import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { ProdottoService } from '../Service/ProdottoService';

@Component({
  selector: 'app-prodotto-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prodotto-detail-component.html',
  styleUrls: ['./prodotto-detail-component.css'],
})
export class ProdottoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly prodottoService = inject(ProdottoService);

  prodotto = signal<ProdottoDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  quantita = signal(1);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || isNaN(id) || id <= 0) {
      this.error.set('ID prodotto non valido.');
      this.loading.set(false);
      return;
    }

    this.prodottoService.findById(id).pipe(take(1)).subscribe({
      next: (item) => {
        this.prodotto.set(item);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento prodotto:', err);
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
    if (!item) {
      return;
    }

    console.log('Aggiunta al carrello:', {
      prodotto: item,
      quantita: this.quantita()
    });

    alert(`"${item.nome}" aggiunto al carrello. Quantità: ${this.quantita()}`);
  }
}