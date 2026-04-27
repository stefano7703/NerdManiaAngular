import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OrdineDto } from '../Dto/OrdineDto';
import { AbstractService } from './abstract-service';

@Injectable({
  providedIn: 'root'
})
export class OrdineService extends AbstractService<OrdineDto> {

  constructor(http: HttpClient) {
    super(http);
    this.type = 'Ordine';
  }

  getAllOrdini(): Observable<OrdineDto[]> {
  const token = localStorage.getItem('token');

  return this.http.get<OrdineDto[]>(
    this.baseUrl + '/' + this.type + '/getAll',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

  findByUserUsername(username: string): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findByUserUsername?username=' + username
    );
  }

  findAllByOrderByCostoTotaleDesc(): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findAllByOrderByCostoTotaleDesc'
    );
  }

  findAllByOrderByCostoTotaleAsc(): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findAllByOrderByCostoTotaleAsc'
    );
  }

  findByIndirizzoSpedizioneContainingIgnoreCase(indirizzo: string): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findByIndirizzoSpedizioneContainingIgnoreCase?testo=' + indirizzo
    );
  }

  findByCostoTotaleGreaterThan(prezzo: number): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findByCostoTotaleGreaterThan?prezzo=' + prezzo
    );
  }

  findByCostoTotaleLessThan(prezzo: number): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findByCostoTotaleLessThan?prezzo=' + prezzo
    );
  }

  findByProdottiId(prodottoId: number): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(
      this.baseUrl + '/' + this.type + '/findByProdottiId?prodottoId=' + prodottoId
    );
  }
}