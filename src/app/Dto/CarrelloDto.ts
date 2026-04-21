import { OrdineDto } from "./OrdineDto";
import { UserDto } from "./UserDto";

export class CarrelloDto {
  id: number;
  prezzoTotale: number;
  quantita: number;
  peso: number;
  user?: UserDto | null ;
  ordine?: OrdineDto | null;


  constructor(
  prezzoTotale: number,
  quantita: number,
  peso: number,
  user?: UserDto | null,
  ordine?: OrdineDto | null,
  id = 0
  ){
  this.id = id;
  this.prezzoTotale = prezzoTotale;
  this.quantita = quantita;
  this.peso = peso;
  this.user = user ?? null;
  this.ordine = ordine ?? null;
  }
}



