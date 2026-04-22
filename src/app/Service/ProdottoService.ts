import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProdottoDto } from '../Dto/ProdottoDto';

type ProdottoPageResponse = {
  content?: ProdottoDto[];
};

@Injectable({
  providedIn: 'root',
})
export class ProdottoService {

  private apiUrl = 'http://localhost:8080/Prodotto';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProdottoDto[]> {
    const params = new HttpParams().set('page', '0').set('size', '200');
    return this.http
      .get<ProdottoPageResponse>(`${this.apiUrl}/prodotti`, { params })
      .pipe(map((response) => response.content ?? []));
  }

  getById(id: number): Observable<ProdottoDto> {
    return this.http.get<ProdottoDto>(`${this.apiUrl}/${id}`);
  }

  create(prodotto: ProdottoDto): Observable<ProdottoDto> {
    return this.http.post<ProdottoDto>(this.apiUrl, prodotto);
  }

  update(id: number, prodotto: ProdottoDto): Observable<ProdottoDto> {
    return this.http.put<ProdottoDto>(`${this.apiUrl}/${id}`, prodotto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string): Observable<ProdottoDto[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ProdottoDto[]>(`${this.apiUrl}/search`, { params });
  }
}