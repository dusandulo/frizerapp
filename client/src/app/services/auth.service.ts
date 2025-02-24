import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
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
        this.router.navigate(['/auth/otp']);
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.isUserVerified) {
          localStorage.setItem('token', response.token);
          this.setAuthState(AuthState.AUTHENTICATED);
          this.router.navigate(['/dashboard']);
        } else {
          this.setAuthState(AuthState.OTP);
          localStorage.setItem('emailForOTP', credentials.email);
          this.router.navigate(['/auth/otp']);
        }
      })
    );
  }

  refreshToken(): Observable<string> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((response) => response.token),
        tap((newToken) => {
          localStorage.setItem('token', newToken);
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          console.log('Logout uspešan na backend-u');
        },
        error: (err) => {
          console.error('Greška pri logout-u na backend-u:', err);
        },
        complete: () => {
          localStorage.clear();
          this.setAuthState(AuthState.LOGIN);
          this.router.navigate(['/auth']);
        },
      });
  }

  setAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
    this.saveAuthState(state);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.apiUrl}/current`, { headers });
  }

  updateUser(userId: number, updateData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(`${this.apiUrl}/${userId}`, updateData, { headers });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.setAuthState(AuthState.AUTHENTICATED);
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { email });
  }

  getUsers(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${this.apiUrl}/users`, { headers });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
