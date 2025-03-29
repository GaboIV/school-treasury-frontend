import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsComponent } from './notifications.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationCreateComponent } from './components/notification-create/notification-create.component';
import { RoleGuard } from '../auth/services/role.guard';
import { UserRole } from '../auth/services/role.service';

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
    children: [
      {
        path: '',
        component: NotificationListComponent,
      },
      {
        path: 'crear',
        component: NotificationCreateComponent,
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Administrator] }
      },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
