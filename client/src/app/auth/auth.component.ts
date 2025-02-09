import { Component, OnInit } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OtpComponent } from './otp/otp.component';
import { CommonModule } from '@angular/common';
import { AuthState } from '../enums/auth-state.enum';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [LoginComponent, RegisterComponent, OtpComponent, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  authState: AuthState = AuthState.LOGIN;
  AuthState = AuthState;
  isUserVerified: boolean | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.isUserVerified = user.isUserVerified;
          if (this.isUserVerified) {
            this.router.navigate(['/dashboard']);
          } else {
            this.authState = AuthState.OTP;
          }
        }
      },
      error: () => {
        this.isUserVerified = false;
      }
    });

    this.authService.authState$.subscribe(state => {
      this.authState = state;
    });
  }

  setAuthState(state: AuthState) {
    this.authState = state;
  }
}
