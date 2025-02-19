import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { AuthState } from './enums/auth-state.enum';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  AuthState = AuthState;
  authState: AuthState = AuthState.LOGIN;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.authState$.subscribe((state: AuthState) => {
      this.authState = state;
    });
  }
}