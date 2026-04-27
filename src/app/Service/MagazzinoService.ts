import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MagazzinoDto } from '../Dto/MagazzinoDto';

@Injectable({
  providedIn: 'root',
})
export class MagazzinoService {
  private apiUrl = 'http://localhost:8080/Magazzino';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MagazzinoDto[]> {
    return this.http.get<MagazzinoDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<MagazzinoDto> {
    return this.http.get<MagazzinoDto>(`${this.apiUrl}/${id}`);
  }

  create(magazzino: MagazzinoDto): Observable<MagazzinoDto> {
    return this.http.post<MagazzinoDto>(this.apiUrl, magazzino);
  }

  update(id: number, magazzino: MagazzinoDto): Observable<MagazzinoDto> {
    return this.http.put<MagazzinoDto>(`${this.apiUrl}/${id}`, magazzino);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/search`, { params });
  }

  findMagazziniConScorteBasse(soglia: number): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('soglia', soglia);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/findMagazziniConScorteBasse`, { params });
  }

  findMagazziniConScorteAlte(soglia: number): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('soglia', soglia);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/findMagazziniConScorteAlte`, { params });
  }

  findByCodice(codice: string): Observable<MagazzinoDto> {
    const params = new HttpParams().set('codice', codice);
    return this.http.get<MagazzinoDto>(`${this.apiUrl}/findByCodice`, { params });
  }

  findMagazziniByProdottoId(prodottoId: number): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('prodottoId', prodottoId);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/findMagazziniByProdottoId`, { params });
  }

  findMagazziniByNomeProdotto(nome: string): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/findMagazziniByNomeProdotto`, { params });
  }
}