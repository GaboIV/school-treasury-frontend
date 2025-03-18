import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../modules/auth';
import { UserRole } from '../modules/auth/services/role.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  private currentUserRoles: any;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    this.currentUserRoles = this.authService.getUserRoles();
  }

  @Input() set appHasRole(allowedRoles: string[]) {
    const allowedRolesEnum = allowedRoles.map((role: any) => {
      switch (role) {
        case 'Admin':
          return UserRole.Administrator;
        case 'Representative':
          return UserRole.Representative;
        default:
          return null;
      }
    }).filter((role: any) => role !== null);

    if (this.currentUserRoles.some((role: any) => allowedRolesEnum.includes(role))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
