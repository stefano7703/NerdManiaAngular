import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdineDto } from '../../Dto/OrdineDto';
import { OrdineService } from '../../Service/ordineService';

@Component({
  selector: 'app-admin-ordini-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-ordini-component.html',
  styleUrl: './admin-ordini-component.css'
})
export class AdminOrdiniComponent implements OnInit {
  ordini = signal<OrdineDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private OrdineService: OrdineService) {}

  ngOnInit(): void {
    this.loadOrdini();
  }

  loadOrdini(): void {
    this.loading.set(true);
    this.error.set(null);

    this.OrdineService.getAllOrdini().subscribe({
     next: (data: OrdineDto[]) => {
    this.ordini.set(data ?? []);
    this.loading.set(false);
     },
     error: (err: unknown) => {
    console.error('Errore caricamento ordini:', err);
    this.error.set('Errore durante il caricamento degli ordini.');
    this.loading.set(false);
  }
});
  }
}