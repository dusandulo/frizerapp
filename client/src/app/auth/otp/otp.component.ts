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
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  otp: string = '';
  email: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

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
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        console.log('OTP verified successfully', response);
        this.isLoading = false;
        this.successMessage = 'OTP verified! Redirecting to dashboard...';
        setTimeout(() => {
          this.authService.setAuthState(AuthState.LOGIN);
          this.router.navigate(['/dashboard']).then(() => {
            this.successMessage = null; 
          });
        }, 2000); 
      },
      error: (error) => {
        console.error('OTP verification failed', error);
        this.isLoading = false;
        this.errorMessage = 'Invalid OTP. Please try again.';
      }
    });
  }

  resendOtp() {
    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.resendOtp(this.email).subscribe({
      next: (response) => {
        console.log('OTP resent successfully', response);
        this.isLoading = false;
        this.successMessage = 'OTP resent successfully! Check your email.';
        setTimeout(() => {
          this.successMessage = null; 
        }, 2000);
      },
      error: (error) => {
        console.error('Resend OTP failed', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to resend OTP. Please try again.';
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