import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Service/AuthService';
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
  ) {}

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
        this.router.navigate(['/home']);
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
        alert('Registrazione completata');
        this.mode = 'login';
        this.registerForm.reset();
      },
      error: () => {

          this.errorMessage = 'Errore registrazione';

      },
    });
  }
}
