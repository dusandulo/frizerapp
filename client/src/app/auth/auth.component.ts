import { Component, OnInit } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OtpComponent } from './otp/otp.component';
import { CommonModule } from '@angular/common';
import { AuthState } from '../enums/auth-state.enum';
import { AuthService } from '../services/auth.service';

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
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.authState = state;
      this.isLoggedIn = state === AuthState.AUTHENTICATED;
    });
  }

  setAuthState(state: AuthState) {
    this.authService.setAuthState(state);
  }
}