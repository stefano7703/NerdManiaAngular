import { Component, OnInit } from '@angular/core';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { ProdottoService } from '../Service/ProdottoService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prodotto',
  imports: [CommonModule],
  templateUrl: './prodotto-component.html',
  styleUrls: ['./prodotto-component.css'],
  standalone: true,
})
export class ProdottoComponent implements OnInit {

  service: ProdottoService;
  ListProdotti: ProdottoDto[] = [];
  prodotto!: ProdottoDto;

  ngOnInit() {

  }

  constructor(service: ProdottoService) {
    this.service = service;
  }

  findById(id: number) {
  this.service.findById(id).subscribe(prodotto => {
    this.prodotto = prodotto;
  });
  }

  findProdottiEconomici(prezzoMax: number) {
    this.service.findProdottiEconomici(prezzoMax).subscribe(prodotti => {
      this.ListProdotti = prodotti;
    });
  }

  findProdottiCostosi(prezzoMin: number) {
    this.service.findProdottiCostosi(prezzoMin).subscribe(prodotti => {
      this.ListProdotti = prodotti;
    });
  }

  findByPesoRange(pesoMin: number, pesoMax: number) {
    this.service.findByPesoRange(pesoMin, pesoMax).subscribe(prodotti => {
      this.ListProdotti = prodotti;
    });
  }

  findAllOrderByNome() {
    this.service.findAllOrderByNome().subscribe(prodotti => {
      this.ListProdotti = prodotti;
    });
  }

  findByCategoriaId(categoriaId: number) {
    this.service.findByCategoriaId(categoriaId).subscribe(prodotti => {
      this.ListProdotti = prodotti;
    });
  }
}