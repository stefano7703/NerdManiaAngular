import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserDto } from '../Dto/UserDto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.syncFromStorage();
  }

  // ---------------- UTILITY ----------------
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ---------------- INIT SYNC ----------------
  private syncFromStorage() {
    if (!this.isBrowser()) return;

    const token = localStorage.getItem('token');
    this.loggedInSubject.next(!!token);
  }

  // ---------------- AUTH ----------------
  login(token: string) {
    if (!this.isBrowser()) return;

    localStorage.setItem('token', token);
    this.loggedInSubject.next(true);
  }

  logout() {
    if (!this.isBrowser()) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartId');

    this.loggedInSubject.next(false);
  }

  // ---------------- TOKEN ----------------
  private getToken(): string | null {
    if (!this.isBrowser()) return null;

    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ---------------- USER ----------------
  getUser(): UserDto | null {
    if (!this.isBrowser()) return null;

    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.ruolo === 'ADMIN';
  }
}
