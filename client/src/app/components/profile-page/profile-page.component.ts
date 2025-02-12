import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      },
    });
  }
}
