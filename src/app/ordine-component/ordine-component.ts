import { Component, computed, OnInit, signal } from '@angular/core';
import { OrdineDto } from '../Dto/OrdineDto';
import { OrdineService } from '../Service/OrdineService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ordine',
  imports: [CommonModule],
  templateUrl: './ordine-component.html',
  styleUrl: './ordine-component.css',
  standalone: true,
})
export class OrdineComponent implements OnInit{

  service: OrdineService; 
  ListOrdini: OrdineDto[]=[];

  ngOnInit(){

}

  constructor(service: OrdineService) {
    this.service = service;
  }

  findByUserUsername(username: string) {
  this.service.findByUserUsername(username).subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }

  findAllByOrderByCostoTotaleDesc() {
  this.service.findAllByOrderByCostoTotaleDesc().subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }

  findAllByOrderByCostoTotaleAsc() {
  this.service.findAllByOrderByCostoTotaleAsc().subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }

  findByIndirizzoSpedizioneContainingIgnoreCase(indirizzo: string) {
  this.service.findByIndirizzoSpedizioneContainingIgnoreCase(indirizzo).subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }

  findByCostoTotaleGreaterThan(prezzo: number) {
  this.service.findByCostoTotaleGreaterThan(prezzo).subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }


  findByCostoTotaleLessThan(prezzo: number) {
  this.service.findByCostoTotaleLessThan(prezzo).subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }


  findByProdottiId(prodottoId:number) {
  this.service.findByProdottiId(prodottoId).subscribe(ordini => {
  this.ListOrdini=ordini;
  })
  }
}