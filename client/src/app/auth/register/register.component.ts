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
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  credentials = {
    name: '',
    email: '',
    password: '',
    role: 'Client',
  };

  @Output() loginClicked = new EventEmitter<void>();
  @Output() otpClicked = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        localStorage.setItem('emailForOTP', this.credentials.email);
        this.otpClicked.emit();
      },
      error: (error) => {
        console.error('Registration failed', error);
        const errorMsg = error.error;
        if (typeof errorMsg === 'string' && errorMsg.includes('Email already exists')) {
          alert('This email address is already registered. Please use a different email.');
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    });
  }

  onLoginClick() {
    this.loginClicked.emit();
  }
}
