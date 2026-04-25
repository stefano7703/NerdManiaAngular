import { OrdineDto } from "../Dto/OrdineDto";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { AbstractService } from "./abstract-service";

@Injectable({
  providedIn: 'root'
})
export class ordineService extends AbstractService<OrdineDto>{

  constructor(http: HttpClient) {
    super(http);
    this.type = 'Ordine';
     const baseProjectUrl = this.baseUrl + '/' + this.type;
  }

    findByUserUsername(username: string): Observable<OrdineDto[]> {
        return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findByUserUsername?username='+ username);
    }

    /*
    inviaEmailOrdine(id:number): Observable<OrdineDto> {
        return this.http.post<OrdineDto>(this.baseUrl + '/' + this.type + '/inviaEmailOrdine?id='+ id);
    }
    */

  findAllByOrderByCostoTotaleDesc(): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findAllByOrderByCostoTotaleDesc');
  }

  findAllByOrderByCostoTotaleAsc(): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findAllByOrderByCostoTotaleAsc');
  }

  findByIndirizzoSpedizioneContainingIgnoreCase(indirizzo:string): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findByIndirizzoSpedizioneContainingIgnoreCase?testo='+ indirizzo);
  }

  findByCostoTotaleGreaterThan(prezzo: number): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findByCostoTotaleGreaterThan?prezzo='+ prezzo);
  }

  findByCostoTotaleLessThan(prezzo: number): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findByCostoTotaleLessThan?prezzo='+ prezzo);
  }

  findByProdottiId(prodottoId:number): Observable<OrdineDto[]> {
    return this.http.get<OrdineDto[]>(this.baseUrl + '/' + this.type + '/findByProdottiId?prodottoId='+ prodottoId);
  }
}