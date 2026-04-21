import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MagazzinoDto } from '../Dto/MagazzinoDto';

@Injectable({
  providedIn: 'root',
})
export class MagazzinoService {

  private apiUrl = 'http://localhost:8080/api/magazzini';

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
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/scorte-basse`, { params });
  }

  findMagazziniConScorteAlte(soglia: number): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('soglia', soglia);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/scorte-alte`, { params });
  }

  findByCodice(codice: string): Observable<MagazzinoDto> {
    return this.http.get<MagazzinoDto>(`${this.apiUrl}/codice/${codice}`);
  }

  findMagazziniByProdottoId(prodottoId: number): Observable<MagazzinoDto[]> {
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/prodotto/${prodottoId}`);
  }

  findMagazziniByNomeProdotto(nomeProdotto: string): Observable<MagazzinoDto[]> {
    const params = new HttpParams().set('nomeProdotto', nomeProdotto);
    return this.http.get<MagazzinoDto[]>(`${this.apiUrl}/nome-prodotto`, { params });
  }
}