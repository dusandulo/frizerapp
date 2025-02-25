import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  credentials = {
    name: '',
    email: '',
    password: '',
    role: 'Client',
  };
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  @Output() loginClicked = new EventEmitter<void>();
  @Output() otpClicked = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to OTP...';
        localStorage.setItem('emailForOTP', this.credentials.email);
        setTimeout(() => {
          this.otpClicked.emit();
          this.successMessage = null;
        }, 2000); 
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.isLoading = false;
        const errorMsg = error.error;
        if (typeof errorMsg === 'string' && errorMsg.includes('Email already exists')) {
          this.errorMessage = 'This email address is already registered. Please use a different email.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  onLoginClick() {
    this.loginClicked.emit();
  }
}