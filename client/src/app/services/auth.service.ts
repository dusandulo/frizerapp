import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse } from '../models/auth-response.model';
import { AuthState } from '../enums/auth-state.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>(this.getInitialAuthState());
  authState$ = this.authStateSubject.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  private getInitialAuthState(): AuthState {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      return AuthState.AUTHENTICATED;
    }
    return AuthState.LOGIN;
  }

  private saveAuthState(state: AuthState): void {
    localStorage.setItem('authState', state.toString());
  }

  register(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, credentials).pipe(
      tap(() => {
        this.setAuthState(AuthState.OTP);
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this.setAuthState(AuthState.AUTHENTICATED);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('authState');
    this.setAuthState(AuthState.LOGIN);
    this.router.navigate(['/auth']);
  }

  setAuthState(state: AuthState) {
    this.authStateSubject.next(state);
    this.saveAuthState(state);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/current`, { headers });
  }

  updateUser(userId: number, updateData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.apiUrl}/${userId}`, updateData, { headers: headers });
  }
}
