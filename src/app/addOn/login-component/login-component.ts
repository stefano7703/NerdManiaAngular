import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { CarrelloDto } from '../../Dto/CarrelloDto';
import { AuthService } from '../../Service/AuthService';
import { CarrelloService } from '../../Service/CarrelloService';
import { UserDto } from '../../Dto/UserDto';

interface LoginResponse {
  message: string;
  token: string;
  user: UserDto;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private apiUrl = 'http://localhost:8080/auth';

  mode: 'login' | 'register' = 'login';

  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private carrelloService: CarrelloService,
  ) {}

  private cartIdStorageKey(userId: number): string {
    return `cartId:user:${userId}`;
  }

  private persistCartIdForUser(userId: number, cartId: number): void {
    localStorage.setItem(this.cartIdStorageKey(userId), String(cartId));
    localStorage.setItem('cartId', String(cartId));
  }

  private storeCartId(userId: number, cart: CarrelloDto | null | undefined): boolean {
    if (userId > 0 && cart?.id !== undefined && cart.id !== null && cart.id > 0) {
      this.persistCartIdForUser(userId, cart.id);
      return true;
    }
    return false;
  }

  private ensureCartForUser(user: UserDto, onDone: () => void): void {
    if (!user?.id) {
      localStorage.removeItem('cartId');
      onDone();
      return;
    }

    if (user.carrello?.id && user.carrello.id > 0) {
      this.persistCartIdForUser(user.id, user.carrello.id);
      onDone();
      return;
    }

    const userRef = { id: user.id } as UserDto;
    this.carrelloService
      .findByUser(userRef)
      .pipe(take(1))
      .subscribe({
        next: (cart) => {
          if (this.storeCartId(user.id!, cart)) {
            onDone();
            return;
          }
          this.createCartForUser(userRef, onDone);
        },
        error: () => {
          this.createCartForUser(userRef, onDone);
        },
      });
  }

  private createCartForUser(userRef: UserDto, onDone: () => void): void {
    const newCart = {
      prezzoTotale: 0,
      quantita: 0,
      peso: 0,
      userId: userRef.id,
    } as CarrelloDto;
    this.carrelloService
      .insert(newCart)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.carrelloService
            .findByUser(userRef)
            .pipe(take(1))
            .subscribe({
              next: (savedCart) => {
                if (!this.storeCartId(userRef.id!, savedCart)) {
                  localStorage.removeItem('cartId');
                }
                onDone();
              },
              error: () => {
                localStorage.removeItem('cartId');
                onDone();
              },
            });
        },
        error: () => {
          localStorage.removeItem('cartId');
          onDone();
        },
      });
  }

  // ---------------- LOGIN FORM ----------------
  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // ---------------- REGISTER FORM ----------------
  registerForm = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cognome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // ---------------- SWITCH ----------------
  showLogin() {
    this.mode = 'login';
    this.errorMessage = '';
  }

  showRegister() {
    this.mode = 'register';
    this.errorMessage = '';
  }

  // ---------------- LOGIN ----------------
  onLogin() {
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.getRawValue();

    this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).subscribe({
      next: (res) => {
        this.authService.login(res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.removeItem('cartId');
        this.ensureCartForUser(res.user, () => this.router.navigate(['/home']));
      },
      error: () => {
        this.errorMessage = 'Credenziali errate';
      },
    });
  }

  // ---------------- REGISTER ----------------
  onRegister() {
    if (this.registerForm.invalid) return;

    const user = this.registerForm.getRawValue();

    this.http.post('http://localhost:8080/User/register', user).subscribe({
      next: () => {
        this.mode = 'login';
        this.showPopup = true
        this.registerForm.reset();
      },
      error: () => {
        this.errorMessage = 'Errore registrazione';
      },
    });
  }

  showPopup = false;

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}
