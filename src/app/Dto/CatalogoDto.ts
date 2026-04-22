import { CategoriaDto } from "./CategoriaDto";

export class CatalogoDto{
    id: number;
    nome: string;
    categorie?: CategoriaDto[] | null;

    constructor(
        id: 0,
        nome: string,
        categorie?: CategoriaDto[]
    ) {
        this.id = id;
        this.nome = nome;
        this.categorie = categorie ?? null;
    }
}