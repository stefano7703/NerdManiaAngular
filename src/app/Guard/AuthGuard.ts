import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Service/AuthService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {

    // 🔒 se è già loggato → blocca login
    if (this.authService.isLoggedIn()) {

      this.router.navigate(['/home']);

      return false;

    }

    // ✅ non loggato → può andare al login
    return true;

  }


}
