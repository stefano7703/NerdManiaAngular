import { CategoriaDto } from "./CategoriaDto";

export class ProdottoDto {

  id?: number;
  nome: string;
  prezzo: number;
  peso: number;
  descrizione: string;
  immagineUrl?: string;
  categoria: CategoriaDto;

  constructor(
    nome: string,
    prezzo: number,
    peso: number,
    descrizione: string,
    categoria: CategoriaDto,
    immagineUrl?: string,
    id?: number
  ) {
    this.id = id;
    this.nome = nome;
    this.prezzo = prezzo;
    this.peso = peso;
    this.immagineUrl = immagineUrl;
    this.descrizione = descrizione;
    this.categoria = categoria;
  }
}