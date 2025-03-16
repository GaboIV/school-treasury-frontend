import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";
import {AuthModule} from "../../modules/auth/auth.module";

@NgModule({
  declarations: [
    KeeniconComponent
  ],
  imports: [
    CommonModule,
    AuthModule
  ],
  exports: [
    KeeniconComponent,
    AuthModule
  ]
})
export class SharedModule {
}
