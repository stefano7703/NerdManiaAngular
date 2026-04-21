import { OrdineDto } from "./OrdineDto";

export class SpedizioneDto {

  id: number;

  altezza: number;

  spessore: number;

  fragile: boolean;

  lunghezza: number;

  peso: number;

  estero: boolean;

  ordine: OrdineDto;

  constructor(id : number , altezza: number, spessore: number, fragile: boolean, lunghezza: number, peso: number, estero: boolean, ordine: OrdineDto) {
    this.id = id;
    this.altezza = altezza;
    this.spessore = spessore;
    this.fragile=fragile;
    this.lunghezza=lunghezza;
    this.peso=peso;
    this.estero=estero;
    this.ordine=ordine;
}
}