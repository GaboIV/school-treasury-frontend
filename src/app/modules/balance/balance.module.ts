import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { BalanceRoutingModule } from './balance-routing.module';
import { BalanceComponent } from './balance.component';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseTypesComponent } from './expense-types/expense-types.component';
import { ProfileDetailsComponent } from './expense-types/forms/profile-details/profile-details.component';
import { EmailPreferencesComponent } from './expense-types/forms/email-preferences/email-preferences.component';
import { NotificationsComponent } from './expense-types/forms/notifications/notifications.component';
import { SignInMethodComponent } from './expense-types/forms/sign-in-method/sign-in-method.component';
import { DeactivateAccountComponent } from './expense-types/forms/deactivate-account/deactivate-account.component';
import { ConnectedAccountsComponent } from './expense-types/forms/connected-accounts/connected-accounts.component';
import { CreateExpenseTypeModalComponent } from './expense-types/modals/create-expense-type-modal/create-expense-type-modal.component';
import { UpdateExpenseTypeModalComponent } from './expense-types/modals/update-expense-type-modal/update-expense-type-modal.component';
import { DeleteExpenseTypeModalComponent } from './expense-types/modals/delete-expense-type-modal/delete-expense-type-modal.component';
import { CreateExpenseModalComponent } from './expenses/modals/create-expense-modal/create-expense-modal.component';
import { UpdateExpenseModalComponent } from './expenses/modals/update-expense-modal/update-expense-modal.component';
import { DeleteExpenseModalComponent } from './expenses/modals/delete-expense-modal/delete-expense-modal.component';
import { PaymentListModalComponent } from './expenses/modals/payment-list-modal/payment-list-modal.component';
import { RegisterPaymentModalComponent } from './expenses/modals/register-payment-modal/register-payment-modal.component';
import { ImagePreviewModalComponent } from './expenses/modals/image-preview-modal/image-preview-modal.component';
import { AdjustAmountModalComponent } from './expenses/modals/adjust-amount-modal/adjust-amount-modal.component';
import { PettyCashComponent } from './petty-cash/petty-cash.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationModule } from '../../modules/i18n/translation.module';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  declarations: [
    BalanceComponent,
    ExpensesComponent,
    ExpenseTypesComponent,
    ProfileDetailsComponent,
    ConnectedAccountsComponent,
    DeactivateAccountComponent,
    EmailPreferencesComponent,
    NotificationsComponent,
    SignInMethodComponent,
    CreateExpenseTypeModalComponent,
    UpdateExpenseTypeModalComponent,
    DeleteExpenseTypeModalComponent,
    CreateExpenseModalComponent,
    UpdateExpenseModalComponent,
    DeleteExpenseModalComponent,
    PaymentListModalComponent,
    RegisterPaymentModalComponent,
    ImagePreviewModalComponent,
    AdjustAmountModalComponent,
    PettyCashComponent
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
