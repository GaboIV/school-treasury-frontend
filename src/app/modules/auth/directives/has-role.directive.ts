import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { RoleService, UserRole } from '../services/role.service';

@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective implements OnInit {
  private roles: UserRole[] = [];
  private isHidden = true;

  constructor(
    private roleService: RoleService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input()
  set hasRole(roles: UserRole | UserRole[]) {
    if (roles) {
      this.roles = Array.isArray(roles) ? roles : [roles];
    }
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    // Si el usuario tiene al menos uno de los roles requeridos
    const hasRole = this.roles.some(role => this.roleService.hasRole(role));

    if (hasRole && this.isHidden) {
      // Si tiene el rol y está oculto, mostramos el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isHidden = false;
    } else if (!hasRole && !this.isHidden) {
      // Si no tiene el rol y está visible, ocultamos el elemento
      this.viewContainer.clear();
      this.isHidden = true;
    }
  }
}
