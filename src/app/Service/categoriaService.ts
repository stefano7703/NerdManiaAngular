import { Injectable } from "@angular/core";
import { CategoriaDto } from "../Dto/CategoriaDto";
import { AbstractService } from "./abstract-service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class categoriaService extends AbstractService<CategoriaDto> {
  private baseProjectUrl: string = '';

  constructor(http: HttpClient) {
    super(http);
    this.type = 'Categoria';
    this.baseProjectUrl = this.baseProjectUrl + '/' + this.type;
  }

  findByNomeContainingIgnoreCase(nome: string) {
    return this.http.get<CategoriaDto[]>(`${this.baseProjectUrl}/findByNomeContainingIgnoreCase?nome=${nome}`);
  }

}
