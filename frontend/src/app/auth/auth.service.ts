import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = '/api/auth';
  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = computed(() => this._isLoggedIn());

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  login(data: any, remember: boolean = false) {
    return this.http.post<any>(`${this.api}/login`, data).pipe(
      tap((res) => {
        if (remember) {
          localStorage.setItem('token', res.token);
        } else {
          sessionStorage.setItem('token', res.token);
        }
        this._isLoggedIn.set(true);
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this._isLoggedIn.set(false);
  }

  updateLoginStatus() {
    this._isLoggedIn.set(this.hasToken());
  }
}

