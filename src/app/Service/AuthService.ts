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

  private syncFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    this.loggedInSubject.next(!!token);
  }

  login(token: string) {
    localStorage.setItem('token', token);
    this.loggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedInSubject.next(false);
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  getUser(): UserDto | null {
    const user = localStorage.getItem('user');

    if (!user) return null;

    return JSON.parse(user);
  }
}
