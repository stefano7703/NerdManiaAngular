import { SpedizioneDto } from "../Dto/SpedizioneDto";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { AbstractService } from "./abstract-service";

@Injectable({
  providedIn: 'root'
})
export class spedizioneService extends AbstractService<SpedizioneDto>{

  constructor(http: HttpClient) {
    super(http);
    this.type = 'Spedizione';
     const baseProjectUrl = this.baseUrl + '/' + this.type;
  }

  findByFragileTrue(): Observable<SpedizioneDto[]> {
    return this.http.get<SpedizioneDto[]>(this.baseUrl + '/' + this.type + '/findByFragileTrue');
  }

    findByPesoGreaterThan(peso:number): Observable<SpedizioneDto[]> {
    return this.http.get<SpedizioneDto[]>(this.baseUrl + '/' + this.type + '/findByPesoGreaterThan?peso='+ peso);
  }

    findByPesoLessThan(peso:number): Observable<SpedizioneDto[]> {
    return this.http.get<SpedizioneDto[]>(this.baseUrl + '/' + this.type + '/findByPesoLessThan?peso='+ peso);
  }

    findByAltezzaBetween(min: number, max: number): Observable<SpedizioneDto[]> {
    return this.http.get<SpedizioneDto[]>(this.baseUrl + '/' + this.type + '/findByAltezzaBetween?min='+ min +'&max='+ max);
  }

    findByOrdineId(id:number): Observable<SpedizioneDto[]> {
    return this.http.get<SpedizioneDto[]>(this.baseUrl + '/' + this.type + '/findByOrdineId?id='+ id);
  }

    findByAltezzaGreaterThanOrLunghezzaGreaterThan(h: number, l: number): Observable<SpedizioneDto[]> {
    return this.http.get<SpedizioneDto[]>(this.baseUrl + '/' + this.type + '/findByAltezzaGreaterThanOrLunghezzaGreaterThan?h='+ h +'&l='+ l);
  }
}