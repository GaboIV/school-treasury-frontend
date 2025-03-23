import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalanceComponent } from './balance.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionTypesComponent } from './collection-types/collection-types.component';
import { PettyCashComponent } from './petty-cash/petty-cash.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { RoleGuard } from '../auth/services/role.guard';
import { MyPaysComponent } from './my-pays/my-pays.component';
import { UserRole } from '../auth/services/role.service';

const routes: Routes = [
  {
    path: '',
    component: BalanceComponent,
    children: [
      {
        path: 'cobros',
        component: CollectionsComponent,
      },
      {
        path: 'cobros/tipos-de-cobros',
        component: CollectionTypesComponent,
      },
      {
        path: 'gastos',
        component: ExpensesComponent,
      },
      {
        path: 'caja-chica',
        component: PettyCashComponent,
      },
      {
        path: 'mis-pagos',
        component: MyPaysComponent,
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Representative] }
      },
      { path: '', redirectTo: 'caja-chica', pathMatch: 'full' },
      { path: '**', redirectTo: 'caja-chica', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BalanceRoutingModule {}
