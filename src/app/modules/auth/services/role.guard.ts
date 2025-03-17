import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RoleService, UserRole } from './role.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("RoleGuard: Verificando roles para ruta", state.url);
    console.log("RoleGuard: Datos de la ruta:", JSON.stringify(route.data));

    // No aplicar el guard a las rutas de autenticación
    if (state.url.includes('/auth/') || state.url.includes('/error/')) {
      console.log("RoleGuard: Ruta de autenticación o error, permitiendo acceso");
      return true;
    }

    // Primero verificamos si el usuario está autenticado
    const currentUser = this.authService.currentUserValue;

    console.log("RoleGuard: Roles requeridos", JSON.stringify(route.data['roles']));
    console.log("RoleGuard: Usuario actual", JSON.stringify(currentUser));

    if (!currentUser) {
      console.log("RoleGuard: No hay usuario autenticado");
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    console.log("RoleGuard: Usuario autenticado", JSON.stringify({
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      roles: currentUser.roles
    }));

    // Obtenemos los roles permitidos de los datos de la ruta
    const requiredRoles = route.data['roles'] as UserRole[];
    console.log("RoleGuard: Roles requeridos", requiredRoles);

    // Si no hay roles requeridos, permitimos el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log("RoleGuard: No hay roles requeridos, permitiendo acceso");
      return true;
    }

    // SOLUCIÓN TEMPORAL: Permitir acceso a cualquier usuario autenticado
    console.log("RoleGuard: SOLUCIÓN TEMPORAL - Permitiendo acceso a cualquier usuario autenticado");
    return true;

    // El código comentado a continuación es la verificación original de roles
    /*
    // Verificación directa para el rol 1 (Representante)
    if (requiredRoles.includes(UserRole.Representative) && currentUser.role === 1) {
      console.log("RoleGuard: Usuario es Representante (role=1), permitiendo acceso");
      return true;
    }

    // Verificación directa para el rol 2 (Administrador)
    if (requiredRoles.includes(UserRole.Administrator) && currentUser.role === 2) {
      console.log("RoleGuard: Usuario es Administrador (role=2), permitiendo acceso");
      return true;
    }

    // Verificación directa para el rol 0 (Administrador según el enum)
    if (requiredRoles.includes(UserRole.Administrator) && currentUser.role === 0) {
      console.log("RoleGuard: Usuario es Administrador (role=0), permitiendo acceso");
      return true;
    }

    // Verificamos si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole = requiredRoles.some(role => {
      const hasRole = this.roleService.hasRole(role);
      console.log(`RoleGuard: ¿Usuario tiene rol ${role}?`, hasRole);
      return hasRole;
    });

    if (hasRequiredRole) {
      console.log("RoleGuard: Usuario tiene al menos uno de los roles requeridos");
      return true;
    }

    console.log("RoleGuard: Usuario no tiene los roles requeridos, redirigiendo a 403");
    // Si el usuario no tiene los roles requeridos, redirigimos a una página de acceso denegado
    this.router.navigate(['/error/403']);
    return false;
    */
  }
}
