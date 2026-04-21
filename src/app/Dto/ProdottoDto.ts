export class ProdottoDto {

  id?: number;
  nome: string;
  prezzo: number;
  peso: number;
  descrizione: string;
  categoria: Categoria;

  constructor(
    nome: string,
    prezzo: number,
    peso: number,
    descrizione: string,
    categoria: Categoria,
    id?: number
  ) {
    this.id = id;
    this.nome = nome;
    this.prezzo = prezzo;
    this.peso = peso;
    this.descrizione = descrizione;
    this.categoria = categoria;
  }
}