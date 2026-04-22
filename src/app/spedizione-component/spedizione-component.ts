import { Component, computed, OnInit, signal } from '@angular/core';
import { SpedizioneDto } from '../Dto/SpedizioneDto';
import { spedizioneService } from '../Service/spedizioneService';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-ordine',
  imports: [CommonModule],
  templateUrl: './spedizione-component.html',
  styleUrl: './spedizione-component.css',
  standalone: true,
})
export class SpedizioneComponent implements OnInit{

  service: spedizioneService; 
  ListSpedizioni: SpedizioneDto[]=[];

  ngOnInit(){

}

  constructor(service: spedizioneService) {
    this.service = service;
  }

  findByFragileTrue() {
  this.service.findByFragileTrue().subscribe(spedizioni => {
    console.log(spedizioni);
  this.ListSpedizioni=spedizioni;
  })
  }

  findByEsteroTrue() {
  this.service.findByEsteroTrue().subscribe(spedizioni => {
  this.ListSpedizioni=spedizioni;
  })
  }

  findByPesoGreaterThan(peso:number) {
  this.service.findByPesoGreaterThan(peso).subscribe(spedizioni => {
  this.ListSpedizioni=spedizioni;
  })
  }

  findByPesoLessThan(peso:number) {
  this.service.findByPesoLessThan(peso).subscribe(spedizioni => {
  this.ListSpedizioni=spedizioni;
  })
  }

  findByAltezzaBetween(min: number, max: number) {
  this.service.findByAltezzaBetween(min,max).subscribe(spedizioni => {
  this.ListSpedizioni=spedizioni;
  })
  }

  findByOrdineId(id:number) {
  this.service.findByOrdineId(id).subscribe(spedizioni => {
  this.ListSpedizioni=spedizioni;
  })
  }

  findByAltezzaGreaterThanOrLunghezzaGreaterThan(h: number, l: number) {
  this.service.findByAltezzaGreaterThanOrLunghezzaGreaterThan(h,l).subscribe(spedizioni => {
  this.ListSpedizioni=spedizioni;
  })
  }
}