import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateDialogComponent } from './components/update-dialog/update-dialog.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [
    UpdateDialogComponent
  ],
  imports: [
    CommonModule,
    NgbModalModule,
    InlineSVGModule
  ],
  exports: [
    UpdateDialogComponent
  ]
})
export class UpdateModule { }
