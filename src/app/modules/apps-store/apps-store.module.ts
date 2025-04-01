import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppsStoreRoutingModule } from './apps-store-routing.module';
import { AppsStoreComponent } from './apps-store.component';
import { AppCardComponent } from './components/app-card/app-card.component';
import { AppListComponent } from './components/app-list/app-list.component';
import { AppDetailComponent } from './components/app-detail/app-detail.component';

@NgModule({
  declarations: [
    AppsStoreComponent,
    AppListComponent,
    AppCardComponent,
    AppDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppsStoreRoutingModule
  ]
})
export class AppsStoreModule { }
