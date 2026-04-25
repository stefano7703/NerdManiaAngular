import { Component, Output, EventEmitter } from '@angular/core';
import { userService } from '../../Service/userService';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../Dto/UserDto';
import { CarrelloDto } from '../../Dto/CarrelloDto';

@Component({
  selector: 'app-add-user-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user-component.html',
  styleUrl: './add-user-component.css',
})
export class AddUserComponent {
  constructor(private service: userService) {}

  userForm = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cognome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  @Output() onUserAdded = new EventEmitter<UserDto>();

  onSubmit() {
    if (this.userForm.valid) {
      const newUser: UserDto = {
        nome: this.userForm.value.nome!,
        cognome: this.userForm.value.cognome!,
        username: this.userForm.value.username!,
        email: this.userForm.value.email!,
        password: this.userForm.value.password!,
        ruolo: 'USER',
        cartaFedelta: false,
        carrello: new CarrelloDto(0, 0, 0),
        ordini: null,
      };

      this.service.register(newUser).subscribe({
        next: () => {
          this.userForm.reset();
          this.onUserAdded.emit(newUser);
          alert('Registrazione completata');
        },
        error: (err) => console.error("Errore durante l'inserimento dell'utente:", err),
      });
    }
  }
}
