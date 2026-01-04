import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthServiceService, private router: Router) { }

  canActivate(): boolean {
    // SSR -> ne jamais bloquer

    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }
    else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  isAdmin(): boolean {
    if (this.authService.getRole()) {
      return true;
    }
    else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
