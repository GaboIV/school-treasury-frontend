import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";
import { HasRoleDirective } from 'src/app/directives/has-role.directive';

@NgModule({
  declarations: [
    KeeniconComponent,
    HasRoleDirective
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    KeeniconComponent,
    HasRoleDirective
  ]
})
export class SharedModule {
}
