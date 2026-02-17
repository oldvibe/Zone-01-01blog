import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = '/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

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
        this.loggedIn.next(true);
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  updateLoginStatus() {
    this.loggedIn.next(this.hasToken());
  }
}
