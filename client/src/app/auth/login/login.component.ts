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
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  @Output() registerClicked = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  login(){
    console.log(this.credentials);
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed', error);
        alert('Invalid credentials');
      }
    });
  }

  onRegisterClick() {
    this.registerClicked.emit();
  }
}
