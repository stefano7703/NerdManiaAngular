import { userService } from '../Service/userService';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { UserDto } from '../Dto/UserDto';
import { CarrelloDto } from '../Dto/CarrelloDto';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent implements OnInit {
  // Stato del componente tramite Signals
  users = signal<UserDto[]>([]);

  // Signal per un singolo utente (usato per dettagli o form)
  user = signal<UserDto>(
    new UserDto(0, '', '', '', '', false, new CarrelloDto(0, 0, 0), null)
  );

  // Signal per gestire messaggi di errore o disponibilità username/email
  checkResult = signal<{ message: string; exists: boolean | null }>({
    message: '',
    exists: null,
  });

  constructor(private service: userService) {}

  ngOnInit(): void {
    // Se vuoi caricare tutti gli utenti all'avvio, decommenta:
    // this.caricaTutti();
  }

  // --- Metodi di Ricerca ---

  cercaPerNome(nome: string) {
    if (!nome) return;
    this.service.findByNomeContainingIgnoreCase(nome).subscribe((data) => {
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

  // --- Metodi di Verifica (Exists) ---

  verificaUsername(username: string) {
    this.service.exiexistsByUsername(username).subscribe((exists) => {
      this.checkResult.set({
        exists,
        message: exists ? 'Username già occupato' : 'Username disponibile',
      });
    });
  }

  verificaEmail(email: string) {
    this.service.exiexistsByEmail(email).subscribe((exists) => {
      this.checkResult.set({
        exists,
        message: exists ? 'Email già registrata' : 'Email disponibile',
      });
    });
  }

  // --- Utility ---

  reset() {
    this.users.set([]);
    this.checkResult.set({ message: '', exists: null });
  }
}
