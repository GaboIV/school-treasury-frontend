import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';
import { UserRole } from 'src/app/modules/auth/services/role.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  currentUser: any;
  isAdmin: boolean = false;
  isRepresentative: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser) {
      this.isAdmin = this.currentUser.roles.includes(UserRole.Administrator);
      this.isRepresentative = this.currentUser.roles.includes(UserRole.Representative);
    }
  }
}
