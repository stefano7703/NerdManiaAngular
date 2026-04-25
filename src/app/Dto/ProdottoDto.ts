import { CategoriaDto } from "./CategoriaDto";

export class ProdottoDto {

  id?: number;
  nome: string;
  prezzo: number;
  peso: number;
  altezza: number;
  spessore: number;
  fragile: boolean;
  lunghezza: number;
  descrizione: string;
  immagineUrl?: string;
  categoria: CategoriaDto;
  

  constructor(
    nome: string,
    prezzo: number,
    peso: number,
    descrizione: string,
    categoria: CategoriaDto,
    altezza: number,
    spessore: number,
    fragile: boolean,
    lunghezza: number,
    immagineUrl?: string,
    id?: number,
    
  ) {
    this.id = id;
    this.nome = nome;
    this.prezzo = prezzo;
    this.peso = peso;
    this.immagineUrl = immagineUrl;
    this.descrizione = descrizione;
    this.categoria = categoria;
    this.altezza = altezza;
    this.spessore = spessore;
    this.fragile = fragile;
    this.lunghezza = lunghezza;
  }
}