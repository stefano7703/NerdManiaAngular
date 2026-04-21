import { CatalogoDto } from "./CatalogoDto";
import { ProdottoDto } from "./ProdottoDto";

export class CategoriaDto {
  id: number;
  nome: string;
  catalogo: CatalogoDto;
  prodotti: ProdottoDto[];

  constructor(
    id: number,
    nome: string,
    catalogo: CatalogoDto,
    prodotti: ProdottoDto[]
  ) {
    this.id = id;
    this.nome = nome;
    this.catalogo = catalogo;
    this.prodotti = prodotti;
  }
}
