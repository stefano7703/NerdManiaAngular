import { userService } from '../Service/userService';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { UserDto } from '../Dto/UserDto';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { AddUserComponent } from '../addOn/add-user-component/add-user-component';
import { AuthService } from '../Service/AuthService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent implements OnInit {

  showAddUser = signal(false);

  users = signal<UserDto[]>([]);

  user = signal<UserDto>(
    new UserDto(
      0,
      '',
      '',
      '',
      '',
      '',
      '',
      false,
      new CarrelloDto(0, 0, 0),
      null
    )
  );

  ordineAperto: number | null = null;

  isLogged = signal(false);

  checkResult = signal<{ message: string; exists: boolean | null }>({
    message: '',
    exists: null,
  });

  constructor(
    private service: userService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const loggedUser = this.authService.getUser();

    if (loggedUser) {
      this.user.set(loggedUser);
      this.isLogged.set(true);
    }

  }

  toggleSpedizione(id: number) {
  this.ordineAperto = this.ordineAperto === id ? null : id;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /*
  cercaPerNome(nome: string) {
    if (!nome) return;

    this.service
      .findByNomeContainingIgnoreCase(nome)
      .subscribe((data) => {
        this.users.set(data);
      });
  }

  filtraPerCartaFedelta(possiedeCarta: boolean) {

    const call = possiedeCarta
      ? this.service.findByCartaFedeltaTrue()
      : this.service.findByCartaFedeltaFalse();

    call.subscribe((data) => {
      this.users.set(data);
    });
  }

  verificaUsername(username: string) {

    if (!username) return;

    this.service.exiexistsByUsername(username).subscribe({
      next: (exists) => {
        this.checkResult.set({
          exists: exists,
          message: exists
            ? 'Username già occupato'
            : 'Username disponibile',
        });
      },

      error: () => {
        this.checkResult.set({
          exists: true,
          message: 'Errore di connessione al server',
        });
      }
    });

  }

  verificaEmail(email: string) {

    this.service.exiexistsByEmail(email).subscribe((exists) => {

      this.checkResult.set({
        exists,
        message: exists
          ? 'Email già registrata'
          : 'Email disponibile',
      });

    });

  }

  reset() {
    this.users.set([]);
    this.checkResult.set({
      message: '',
      exists: null
    });
  }


  openAddUser() {
    this.showAddUser.set(true);
  }

  closeAddUser() {
    this.showAddUser.set(false);
  }

  onUserAdded(user: UserDto) {

    console.log('Utente aggiunto:', user);

    this.showAddUser.set(false);

  }
    */

}
