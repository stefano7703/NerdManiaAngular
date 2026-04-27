import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../Dto/UserDto';
import { userService } from '../../Service/userService';

@Component({
  selector: 'app-gestione-utenti-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestione-utenti-component.html',
  styleUrl: './gestione-utenti-component.css',
})
export class GestioneUtentiComponent implements OnInit {
  showAddUser = signal(false);

  users = signal<UserDto[]>([]);

  checkResult = signal<{
    message: string;
    exists: boolean | null;
  }>({
    message: '',
    exists: null,
  });

  selectedUserToDelete: UserDto | null = null;
  showDeletePopup = signal(false);

  constructor(private service: userService) {}

  ngOnInit(): void {
    this.caricaTuttiUtenti();
  }

 cercaUtente(testo: string) {

  if (!testo) {
    this.users.set([]);   // importante
    return;
  }

  const parole = testo.trim().split(/\s+/);

  // UNA PAROLA
  if (parole.length === 1) {

    const valore = parole[0];

    this.service
      .findByNomeContainingIgnoreCase(valore)
      .subscribe((data) => {

        if (data && data.length > 0) {

          this.users.set(data);

        } else {

          this.service
            .findByCognomeContainingIgnoreCase(valore)
            .subscribe((data2) => {

              this.users.set(data2 ?? []); // sempre aggiorna

            });

        }

      });

  }

  // NOME + COGNOME
  else {

    const nome = parole[0];
    const cognome = parole.slice(1).join(" ");

    this.service
      .findByNomeContainingIgnoreCaseAndCognomeContainingIgnoreCase(
        nome,
        cognome
      )
      .subscribe((data) => {

        this.users.set(data ?? []); // sempre aggiorna

      });

  }

}


  filtraPerCartaFedelta(possiedeCarta: boolean) {
    const call = possiedeCarta
      ? this.service.findByCartaFedeltaTrue()
      : this.service.findByCartaFedeltaFalse();

    call.subscribe((data) => {
      console.log('RISPOSTA:', data);

      this.users.set(data);
    });
  }

  verificaUsername(username: string) {
    if (!username) return;

    this.service.exiexistsByUsername(username).subscribe({
      next: (exists) => {
        this.checkResult.set({
          exists,
          message: exists ? 'Username già occupato' : 'Username disponibile',
        });
      },

      error: () => {
        this.checkResult.set({
          exists: true,
          message: 'Errore di connessione al server',
        });
      },
    });
  }

  verificaEmail(email: string) {
    if (!email) return;

    this.service.exiexistsByEmail(email).subscribe((exists) => {
      this.checkResult.set({
        exists,
        message: exists ? 'Email già registrata' : 'Email disponibile',
      });
    });
  }

  reset() {
    this.checkResult.set({
      message: '',
      exists: null,
    });

    this.caricaTuttiUtenti();
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

    this.reset();
  }

  caricaTuttiUtenti() {
    this.service.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
      },

      error: (err) => {
        console.error('Errore caricamento utenti:', err);
      },
    });
  }

  toggleCartaFedelta(user: UserDto) {
    const newValue = !user.cartaFedelta;

    this.service.updateCartaFedelta(user.id!, newValue).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, cartaFedelta: newValue } : u)),
        );
      },

      error: (err) => {
        console.error('Errore update carta fedeltà', err);
      },
    });
  }

  deleteUser(user: UserDto) {
    this.selectedUserToDelete = user;
    this.showDeletePopup.set(true);
  }

  confirmDelete() {
  if (!this.selectedUserToDelete?.id) return;

  this.service.delete(this.selectedUserToDelete.id).subscribe({
    next: () => {
      this.users.update(list =>
        list.filter(u => u.id !== this.selectedUserToDelete!.id)
      );

      this.cancelDelete();
    },
    error: (err) => {
      console.error('Errore eliminazione utente', err);
      this.cancelDelete();
    }
  });
}
cancelDelete() {
  this.selectedUserToDelete = null;
  this.showDeletePopup.set(false);
}
}
