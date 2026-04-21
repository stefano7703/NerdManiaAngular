export class MagazzinoDto {

  id?: number;
  nome: string;
  indirizzo: string;
  codice: string;
  quantita: number;
  prodottiId: number[];

  constructor(
    nome: string,
    indirizzo: string,
    codice: string,
    quantita: number,
    prodottiId: number[],
    id?: number
  ) {
    this.id = id;
    this.nome = nome;
    this.indirizzo = indirizzo;
    this.codice = codice;
    this.quantita = quantita;
    this.prodottiId = prodottiId;
  }
}