import { Routes } from '@angular/router';
import { HomeComponent } from './home-component/home-component';
import { CarrelloComponent } from './carrello-component/carrello-component';
import { CatalogoComponent } from './catalogo-component/catalogo-component';
import { MagazzinoComponent } from './magazzino-component/magazzino-component';
import { OrdineComponent } from './ordine-component/ordine-component';
import { ProdottoComponent } from './prodotto-component/prodotto-component';
import { SpedizioneComponent } from './spedizione-component/spedizione-component';
import { UserComponent } from './user-component/user-component';
import { CategoriaComponent } from './categoria-component/categoria-component';

export const routes: Routes = [
     { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'carrello', component: CarrelloComponent},
    { path: 'catalogo', component: CatalogoComponent},
    { path: 'magazzino', component: MagazzinoComponent},
    { path: 'ordine', component: OrdineComponent},
    { path: 'prodotto', component: ProdottoComponent},
    { path: 'spedizione', component: SpedizioneComponent},
    { path: 'user', component: UserComponent},
    { path: 'categoria', component: CategoriaComponent},
    { path: '**', redirectTo: 'home' }
];
