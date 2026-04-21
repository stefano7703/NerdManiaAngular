import { Injectable } from '@angular/core';
import { AbstractService } from './abstract-service';
import { CatalogoDto } from '../Dto/CatalogoDto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService extends AbstractService<CatalogoDto> {

  constructor(protected override http: HttpClient) {
    super(http);
    this.type = 'catalogo';
  }

  // Trova catalogo per nome
  findByNome(nome: string): Observable<CatalogoDto> {
    return this.http.get<CatalogoDto>(
      `${this.baseUrl}/${this.type}/findByNome?nome=${nome}`
    );
  }

  // Controlla esistenza
  existsByNome(nome: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/${this.type}/existsByNome?nome=${nome}`
    );
  }

  // Contiene parola
  findByNomeContaining(nome: string): Observable<CatalogoDto[]> {
    return this.http.get<CatalogoDto[]>(
      `${this.baseUrl}/${this.type}/findByNomeContaining?nome=${nome}`
    );
  }

  // Inizia con
  findByNomeStartingWith(nome: string): Observable<CatalogoDto[]> {
    return this.http.get<CatalogoDto[]>(
      `${this.baseUrl}/${this.type}/findByNomeStartingWith?nome=${nome}`
    );
  }

  // Finisce con
  findByNomeEndingWith(nome: string): Observable<CatalogoDto[]> {
    return this.http.get<CatalogoDto[]>(
      `${this.baseUrl}/${this.type}/findByNomeEndingWith?nome=${nome}`
    );
  }

  // Cataloghi con categorie
  findCataloghiConCategorie(): Observable<CatalogoDto[]> {
    return this.http.get<CatalogoDto[]>(
      `${this.baseUrl}/${this.type}/findCataloghiConCategorie`
    );
  }

  // Cataloghi senza categorie
  findCataloghiSenzaCategorie(): Observable<CatalogoDto[]> {
    return this.http.get<CatalogoDto[]>(
      `${this.baseUrl}/${this.type}/findCataloghiSenzaCategorie`
    );
  }

  // Cataloghi con più di X categorie
  findByNumeroCategorieGreaterThan(size: number): Observable<CatalogoDto[]> {
    return this.http.get<CatalogoDto[]>(
      `${this.baseUrl}/${this.type}/findByNumeroCategorieGreaterThan?size=${size}`
    );
  }
}
