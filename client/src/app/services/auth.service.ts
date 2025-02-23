import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse } from '../models/auth-response.model';
import { AuthState } from '../enums/auth-state.enum';

interface UserCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly authStateSubject = new BehaviorSubject<AuthState>(AuthState.LOGIN);
  private readonly userEmail = new BehaviorSubject<string | null>(null);

  readonly authState$ = this.authStateSubject.asObservable();
  readonly userEmail$ = this.userEmail.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuthState();
  }

  // Auth State Management
  private initializeAuthState(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: () => this.setAuthState(AuthState.AUTHENTICATED),
        error: () => this.logout()
      });
    }
  }

  public setAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  // Authentication Methods
  register(credentials: UserCredentials): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, credentials).pipe(
      tap(() => {
        this.userEmail.next(credentials.email);
        this.setAuthState(AuthState.OTP);
      })
    );
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.isUserVerified) {
            localStorage.setItem('token', response.token);
            this.userEmail.next(credentials.email);
            this.setAuthState(AuthState.AUTHENTICATED);
            this.router.navigate(['/dashboard']);
          } else {
            this.userEmail.next(credentials.email);
            this.setAuthState(AuthState.OTP);
            this.router.navigate(['/auth/otp']);
          }
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          localStorage.clear();
          this.userEmail.next(null);
          this.setAuthState(AuthState.LOGIN);
          this.router.navigate(['/auth']);
        }
      });
  }

  refreshToken(): Observable<any> {
    const email = this.userEmail.getValue();
    
    if (!email) {
      return throwError(() => new Error('User not authenticated'));
    }
  
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/refresh-token`, 
        { email }, 
        { withCredentials: true }
      )
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  // User Management Methods
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/current`, 
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(userId: number, updateData: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${userId}`, 
      updateData, 
      { headers: this.getAuthHeaders() }
    );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/users`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // OTP Methods
  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { email });
  }

  // Helper Methods
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}