import { ProdottoDto } from "./ProdottoDto";
import { SpedizioneDto } from "./SpedizioneDto";
import { UserDto } from "./UserDto";

export class OrdineDto {

  id: number;

  costoTotale: number;

  indirizzoSpedizione: string;

  user: UserDto;

  spedizione: SpedizioneDto;

  prodotti: ProdottoDto[] = [];

  constructor(id : number , costo_totale: number, indirizzo_spedizione:string, user: UserDto, spedizione: SpedizioneDto, prodotti: ProdottoDto[]) {
    this.id = id;
    this.costoTotale = costo_totale;
    this.indirizzoSpedizione=indirizzo_spedizione;
    this.user=user;
    this.spedizione=spedizione;
    this.prodotti=prodotti;
}
}