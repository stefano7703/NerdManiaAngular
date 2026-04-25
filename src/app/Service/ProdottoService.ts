import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProdottoDto } from '../Dto/ProdottoDto';
import { AbstractService } from "./abstract-service";

type ProdottoPageResponse = {
  content?: ProdottoDto[];
};

@Injectable({
  providedIn: 'root',
})
export class ProdottoService extends AbstractService<ProdottoDto>{

   constructor(http: HttpClient) {
    super(http);
    this.type = 'Prodotto';
     const baseProjectUrl = this.baseUrl + '/' + this.type;
  }

findById(id: number): Observable<ProdottoDto> {
  return this.http.get<ProdottoDto>(
    this.baseUrl + '/' + this.type + '/findById?id=' + id
  ).pipe(
    catchError(() => this.read(id))
  );
}

findProdottiEconomici(prezzoMax: number): Observable<ProdottoDto[]> {
  return this.http.get<ProdottoDto[]>(
    this.baseUrl + '/' + this.type + '/findProdottiEconomici?prezzoMax=' + prezzoMax
  );
}

findProdottiCostosi(prezzoMin: number): Observable<ProdottoDto[]> {
  return this.http.get<ProdottoDto[]>(
    this.baseUrl + '/' + this.type + '/findProdottiCostosi?prezzoMin=' + prezzoMin
  );
}

findByPesoRange(pesoMin: number, pesoMax: number): Observable<ProdottoDto[]> {
  return this.http.get<ProdottoDto[]>(
    this.baseUrl + '/' + this.type + '/findByPesoRange?pesoMin=' + pesoMin + '&pesoMax=' + pesoMax
  );
}

findAllOrderByNome(): Observable<ProdottoDto[]> {
  return this.http.get<ProdottoDto[]>(
    this.baseUrl + '/' + this.type + '/findAllOrderByNome'
  );
}

findByCategoriaId(categoriaId: number): Observable<ProdottoDto[]> {
  return this.http.get<ProdottoDto[]>(
    this.baseUrl + '/' + this.type + '/findByCategoriaId?categoriaId=' + categoriaId
  );
}


 







}