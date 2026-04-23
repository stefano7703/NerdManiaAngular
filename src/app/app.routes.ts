import { AddUserComponent } from './addOn/add-user-component/add-user-component';
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
import { LoginComponent } from './addOn/login-component/login-component';
import { AuthGuard } from './Guard/AuthGuard';
import { GestioneUtentiComponent } from './addOn/gestione-utenti-component/gestione-utenti-component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'carrello', component: CarrelloComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'magazzino', component: MagazzinoComponent },
  { path: 'ordine', component: OrdineComponent },
  { path: 'prodotto', component: ProdottoComponent },
  { path: 'spedizione', component: SpedizioneComponent },
  { path: 'categoria', component: CategoriaComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: AddUserComponent },
  {path: 'gestione-utenti', component: GestioneUtentiComponent},
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'home' }
];
