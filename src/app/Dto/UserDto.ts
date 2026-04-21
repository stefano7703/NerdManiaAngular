export class UserDto {
  id: number;
  username: string;
  nome: string;
  cognome: string;
  email: string;
  cartaFedeltà: boolean;

  carrello: CarrelloDto;

  ordini: OrdineDto[];

  constructor(
    id: number,
    username: string,
    nome: string,
    cognome: string,
    email: string,
    cartaFedeltà: boolean,
    carrello: CarrelloDto,
    ordini: OrdineDto[]
  ) {
    this.id = id;
    this.username = username;
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.cartaFedeltà = cartaFedeltà;
    this.carrello = carrello;
    this.ordini = ordini;}
}
