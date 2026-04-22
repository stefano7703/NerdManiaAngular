export class CarrelloDto {
  id?: number;
  prezzoTotale: number;
  quantita: number;
  peso: number;
  userId?: number | null;
  // Legacy fields kept optional for backward compatibility with older responses.
  user?: { id?: number } | null;
  ordine?: { id?: number } | null;


  constructor(
  prezzoTotale: number,
  quantita: number,
  peso: number,
  userId?: number | null,
  id?: number
  ){
  this.id = id;
  this.prezzoTotale = prezzoTotale;
  this.quantita = quantita;
  this.peso = peso;
  this.userId = userId ?? null;
  this.user = null;
  this.ordine = null;
  }
}



