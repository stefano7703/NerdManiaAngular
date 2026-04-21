import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdottoDto } from '../Dto/ProdottoDto';

@Injectable({
  providedIn: 'root',
})
export class ProdottoService {

  private apiUrl = 'http://localhost:8080/api/prodotti';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProdottoDto[]> {
    return this.http.get<ProdottoDto[]>(this.apiUrl);
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