import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsStoreComponent } from './apps-store.component';

const routes: Routes = [
  {
    path: '',
    component: AppsStoreComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsStoreRoutingModule { }
