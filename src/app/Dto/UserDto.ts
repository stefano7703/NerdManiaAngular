import { CarrelloDto } from "./CarrelloDto";
import { OrdineDto } from "./OrdineDto";

export class UserDto {
  id?: number;
  username: string;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  cartaFedelta: boolean = false;

  carrello: CarrelloDto;

  ordini: OrdineDto[] | null;

  constructor(
    id: number,
    username: string,
    nome: string,
    cognome: string,
    email: string,
    password: string,
    cartaFedeltà: boolean,
    carrello: CarrelloDto,
    ordini: OrdineDto[] | null
  ) {
    this.id = id;
    this.username = username;
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.password = password;
    this.cartaFedelta = cartaFedeltà;
    this.carrello = carrello;
    this.ordini = ordini ?? null;}
}
