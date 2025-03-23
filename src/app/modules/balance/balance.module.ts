import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { BalanceRoutingModule } from './balance-routing.module';
import { BalanceComponent } from './balance.component';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { CollectionsComponent } from './collections/collections.component';
import { CollectionTypesComponent } from './collection-types/collection-types.component';
import { ProfileDetailsComponent } from './collection-types/forms/profile-details/profile-details.component';
import { EmailPreferencesComponent } from './collection-types/forms/email-preferences/email-preferences.component';
import { NotificationsComponent } from './collection-types/forms/notifications/notifications.component';
import { SignInMethodComponent } from './collection-types/forms/sign-in-method/sign-in-method.component';
import { DeactivateAccountComponent } from './collection-types/forms/deactivate-account/deactivate-account.component';
import { ConnectedAccountsComponent } from './collection-types/forms/connected-accounts/connected-accounts.component';
import { CreateCollectionTypeModalComponent } from './collection-types/modals/create-collection-type-modal/create-collection-type-modal.component';
import { UpdateCollectionTypeModalComponent } from './collection-types/modals/update-collection-type-modal/update-collection-type-modal.component';
import { DeleteCollectionTypeModalComponent } from './collection-types/modals/delete-collection-type-modal/delete-collection-type-modal.component';
import { CreateCollectionModalComponent } from './collections/modals/create-collection-modal/create-collection-modal.component';
import { DeleteCollectionModalComponent } from './collections/modals/delete-collection-modal/delete-collection-modal.component';
import { PaymentListModalComponent } from './collections/modals/payment-list-modal/payment-list-modal.component';
import { RegisterPaymentModalComponent } from './collections/modals/register-payment-modal/register-payment-modal.component';
import { ImagePreviewModalComponent } from './collections/modals/image-preview-modal/image-preview-modal.component';
import { AdjustAmountModalComponent } from './collections/modals/adjust-amount-modal/adjust-amount-modal.component';
import { PettyCashComponent } from './petty-cash/petty-cash.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationModule } from '../../modules/i18n/translation.module';
import { PipesModule } from './pipes/pipes.module';
import { UpdateCollectionModalComponent } from './collections/modals/update-collection-modal/update-collection-modal.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { DeleteExpenseModalComponent } from './expenses/modals/delete-expense-modal/delete-expense-modal.component';
import { CreateExpenseModalComponent } from './expenses/modals/create-expense-modal/create-expense-modal.component';
import { UpdateExpenseModalComponent } from './expenses/modals/update-expense-modal/update-expense-modal.component';
import { MyPaysComponent } from './my-pays/my-pays.component';
import { PaymentDetailsModalComponent } from './my-pays/modals/payment-details-modal/payment-details-modal.component';
import { PaymentRequestsComponent } from './payment-requests/payment-requests.component';
import { PaymentRequestsManagementComponent } from './payment-requests-management/payment-requests-management.component';
import { RequestPaymentModalComponent } from './payment-requests/modals/request-payment-modal/request-payment-modal.component';

@NgModule({
  declarations: [
    BalanceComponent,
    CollectionsComponent,
    CollectionTypesComponent,
    ProfileDetailsComponent,
    ConnectedAccountsComponent,
    DeactivateAccountComponent,
    EmailPreferencesComponent,
    NotificationsComponent,
    SignInMethodComponent,
    CreateCollectionTypeModalComponent,
    UpdateCollectionTypeModalComponent,
    DeleteCollectionTypeModalComponent,
    CreateCollectionModalComponent,
    UpdateCollectionModalComponent,
    DeleteCollectionModalComponent,
    PaymentListModalComponent,
    RegisterPaymentModalComponent,
    ImagePreviewModalComponent,
    AdjustAmountModalComponent,
    PettyCashComponent,
    ExpensesComponent,
    CreateExpenseModalComponent,
    DeleteExpenseModalComponent,
    UpdateExpenseModalComponent,
    MyPaysComponent,
    PaymentDetailsModalComponent,
    PaymentRequestsComponent,
    PaymentRequestsManagementComponent,
    RequestPaymentModalComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BalanceRoutingModule,
    DropdownMenusModule,
    WidgetsModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbPaginationModule,
    TranslationModule,
    PipesModule,
  ],
})
export class BalanceModule {}
