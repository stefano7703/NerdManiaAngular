import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AddUserComponent } from "../add-user-component/add-user-component";

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddUserComponent],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  errorMessage: string = '';
  showRegister = false;

  loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.getRawValue();

    this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);

        this.errorMessage = '';

        this.router.navigate(['/users']);
      },

      error: () => {
        this.errorMessage = 'Credenziali errate';
      },
    });
  }
}
