import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {InlineSVGModule} from 'ng-inline-svg-2';
import {InviteUsersModalComponent} from './invite-users-modal/invite-users-modal.component';
import {MainModalComponent} from './main-modal/main-modal.component';
import {UpgradePlanModalComponent} from './upgrade-plan-modal/upgrade-plan-modal.component';
import {ModalComponent} from './modal/modal.component';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from "../../../shared/shared.module";
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { PasswordChangeRequiredModalComponent } from './password-change-required-modal/password-change-required-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    InviteUsersModalComponent,
    MainModalComponent,
    UpgradePlanModalComponent,
    ModalComponent,
    ChangePasswordModalComponent,
    PasswordChangeRequiredModalComponent,
  ],
  imports: [
    CommonModule,
    InlineSVGModule,
    RouterModule,
    NgbModalModule,
    SharedModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports: [
    InviteUsersModalComponent,
    MainModalComponent,
    UpgradePlanModalComponent,
    ModalComponent,
    ChangePasswordModalComponent,
    PasswordChangeRequiredModalComponent,
  ],
})
export class ModalsModule {
}
