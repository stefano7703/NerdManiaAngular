export class CatalogoDto{
    id: number;
    nome: string;
    categoria?: CategoriaDto | null;

    constructor(
        id: 0,
        nome: string,
        categoria?: CategoriaDto
    ) {
        this.id = id;
        this.nome = nome;
        this.categoria = categoria ?? null;
    }
}