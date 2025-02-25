import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  @Output() registerClicked = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.isLoading = false;
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']).then(() => {
            this.successMessage = null; 
          });
        }, 2000);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid credentials. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goToRegister() {
    this.registerClicked.emit();
  }
}