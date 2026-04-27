import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Service/AuthService';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
  console.log('isLoggedIn:', this.authService.isLoggedIn());
  console.log('isAdmin:', this.authService.isAdmin());

  if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
    return true;
  }

  this.router.navigate(['/home']);
  return false;
}
  /*
  canActivate(): boolean {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
  */
}