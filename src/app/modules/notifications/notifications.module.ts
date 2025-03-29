import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationModule } from '../i18n/translation.module';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationCreateComponent } from './components/notification-create/notification-create.component';
import { NotificationCreateModalComponent } from './components/notification-create-modal/notification-create-modal.component';
import { SharedModule } from '../../_metronic/shared/shared.module';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationListComponent,
    NotificationCreateComponent,
    NotificationCreateModalComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NotificationsRoutingModule,
    DropdownMenusModule,
    WidgetsModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbPaginationModule,
    NgbModalModule,
    TranslationModule
  ],
})
export class NotificationsModule {}
