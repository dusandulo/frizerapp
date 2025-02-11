import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  profileForm: FormGroup;
  userId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] 
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.userId) {
      this.errorMessage = null;
      this.successMessage = null;

      const updateData = this.profileForm.value;

      this.authService.updateUser(this.userId, updateData).subscribe({
        next: (response) => {
          console.log('Profile updated successfully', response);
          this.successMessage = 'Profile updated successfully!';
        },
        error: (error) => {
          console.error('Profile update failed', error);
          this.errorMessage = 'Profile update failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
    }
  }
}
