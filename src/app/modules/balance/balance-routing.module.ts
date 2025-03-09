import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalanceComponent } from './balance.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseTypesComponent } from './expense-types/expense-types.component';

const routes: Routes = [
  {
    path: '',
    component: BalanceComponent,
    children: [
      {
        path: 'gastos/gastos',
        component: ExpensesComponent,
      },
      {
        path: 'gastos/tipos-de-gastos',
        component: ExpenseTypesComponent,
      },
      { path: '', redirectTo: 'gastos/gastos', pathMatch: 'full' },
      { path: '**', redirectTo: 'gastos/gastos', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BalanceRoutingModule {}
