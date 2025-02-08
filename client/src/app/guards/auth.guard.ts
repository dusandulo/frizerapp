import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    const url: string = state.url;

    if (this.authService.isLoggedIn()) {
      if (url.startsWith('/auth')) {
        this.router.navigate(['/dashboard']);
        return false;
      }
      return true;
    } else {
      if (url.startsWith('/auth')) {
        return true;
      }
      this.router.navigate(['/auth']);
      return false;
    }
  }
}