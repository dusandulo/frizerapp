import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthState } from '../../enums/auth-state.enum';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss'
})
export class OtpComponent implements OnInit {
  otp: string = '';
  email: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('emailForOTP') || '';
    if (!this.email) {
      this.router.navigate(['/auth/register']); 
    }
  }

  verifyOtp() {
    if (this.otp.trim().length !== 6) {
      this.errorMessage = 'OTP must be 6 digits.';
      alert(this.errorMessage);
      return;
    }
    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        console.log('OTP verified successfully', response);
        this.authService.setAuthState(AuthState.LOGIN);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('OTP verification failed', error);
        this.errorMessage = 'Invalid OTP. Please try again.';
        alert(this.errorMessage);
      }
    });
  }

  resendOtp() {
    this.authService.resendOtp(this.email).subscribe({
      next: (response) => {
        console.log('OTP resent successfully', response);
        alert('OTP resent successfully. Please check your email.');
      },
      error: (error) => {
        console.error('Resend OTP failed', error);
        alert('Failed to resend OTP. Please try again.');
      }
    });
  }

  isNumberKey(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

}
