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
import { ProdottoDetailComponent } from './prodotto-detail-component/prodotto-detail-component';
import { GestioneUtentiComponent } from './addOn/gestione-utenti-component/gestione-utenti-component';
import { AdminProdottoComponent } from './admin-prodotto-component/admin-prodotto-component';
import { AdminGuard } from './Guard/AdminGuard';

export const routes: Routes = [
  {path: 'admin/prodotti', component: AdminProdottoComponent, canActivate: [AdminGuard]},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'carrello', component: CarrelloComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'magazzino', component: MagazzinoComponent, canActivate: [AdminGuard] },
  { path: 'ordine', component: OrdineComponent, canActivate: [AdminGuard] },
  { path: 'prodotto/:id', component: ProdottoDetailComponent },
  { path: 'prodotto', component: ProdottoComponent },
  { path: 'spedizione', component: SpedizioneComponent,canActivate: [AdminGuard] },
  { path: 'categoria', component: CategoriaComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard]},
  { path: 'register', component: AddUserComponent, canActivate: [AuthGuard]},
  {path: 'gestione-utenti', component: GestioneUtentiComponent, canActivate: [AdminGuard]},
  {path: 'user', component: UserComponent},
  { path: '**', redirectTo: 'home' }
];
