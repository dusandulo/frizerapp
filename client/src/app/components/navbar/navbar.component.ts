import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Input() isLoggedIn: boolean = false;
  profileMenuOpen: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(
      map(user => user.role === 1) // 1 is the admin role
    ).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  logout() {
    this.authService.logout();
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
    this.profileMenuOpen = false;
  }
  openProfile() {
    this.router.navigate(['/profile-page']);
    this.profileMenuOpen = false;
  }

 //TODO isAdmin() 

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (
      this.profileMenuOpen &&
      !this.eRef.nativeElement.contains(event.target)
    ) {
      this.profileMenuOpen = false;
    }
  }
}
