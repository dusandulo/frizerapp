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
    password: ''
  };

  @Output() loginClicked = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.loginClicked.emit(); 
      },
      error: (error) => {
        console.error('Registration failed', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  onLoginClick() {
    this.loginClicked.emit();
  }
}
