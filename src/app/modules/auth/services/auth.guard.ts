import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("AuthGuard: Verificando autenticación para ruta", state.url);
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      console.log("AuthGuard: Usuario autenticado", JSON.stringify({
        id: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        roles: currentUser.roles,
        authToken: currentUser.authToken ? 'Presente' : 'No presente'
      }));
      return true;
    }

    console.log("AuthGuard: Usuario no autenticado, redirigiendo a login");
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
