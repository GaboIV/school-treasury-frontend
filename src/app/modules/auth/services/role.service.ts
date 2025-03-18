import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export enum UserRole {
  Representative = 1,
  Administrator = 0
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private authService: AuthService) {}

  /**
   * Verifica si el usuario actual tiene el rol especificado
   */
  hasRole(role: UserRole): boolean {
    console.log("RoleService: Verificando si el usuario tiene el rol", role);
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      console.log("RoleService: No hay usuario actual");
      return false;
    }

    console.log("RoleService: Usuario actual", JSON.stringify({
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      roles: currentUser.roles,
      hasRoleProperty: currentUser.hasOwnProperty('role'),
      hasRolesProperty: currentUser.hasOwnProperty('roles'),
      roleType: typeof currentUser.role,
      rolesType: typeof currentUser.roles
    }));

    // Verificar si el rol está en el array de roles
    if (Array.isArray(currentUser.roles) && currentUser.roles.includes(role)) {
      console.log(`RoleService: El rol ${role} está en el array de roles`);
      return true;
    }

    // O verificar si el rol coincide con la propiedad role
    const hasMatchingRole = currentUser.role === role;
    console.log(`RoleService: El rol ${role} coincide con la propiedad role: ${hasMatchingRole}`);
    console.log(`RoleService: Comparación de roles: ${currentUser.role} === ${role}`);

    // Verificación adicional para el caso específico del rol 1 (Representante)
    if (role === UserRole.Representative && currentUser.role === 1) {
      console.log("RoleService: El usuario es un Representante (role=1)");
      return true;
    }

    // Verificación adicional para el caso específico del rol 0 (Administrador)
    if (role === UserRole.Administrator && currentUser.role === 0) {
      console.log("RoleService: El usuario es un Administrador (role=0)");
      return true;
    }

    return hasMatchingRole;
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.Administrator);
  }

  /**
   * Verifica si el usuario actual es representante
   */
  isRepresentative(): boolean {
    return this.hasRole(UserRole.Representative);
  }

  /**
   * Obtiene el nombre del rol del usuario actual
   */
  getRoleName(): string {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return '';
    }

    // Determinar el rol del usuario
    let userRole: UserRole | undefined;

    if (Array.isArray(currentUser.roles) && currentUser.roles.length > 0) {
      userRole = currentUser.roles[0];
    } else if (currentUser.role !== undefined) {
      userRole = currentUser.role;
    }

    console.log("RoleService: Determinando nombre del rol para", userRole);

    switch (userRole) {
      case UserRole.Administrator:
        return 'Administrador';
      case UserRole.Representative:
        return 'Representante';
      default:
        return 'Usuario';
    }
  }
}
