import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './access.component';
import { StudentsComponent } from './students/students.component';

const routes: Routes = [
  {
    path: '',
    component: AccessComponent,
    children: [
      {
        path: 'estudiantes',
        component: StudentsComponent,
      },
      { path: '', redirectTo: 'estudiantes', pathMatch: 'full' },
      { path: '**', redirectTo: 'estudiantes', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessRoutingModule {}
