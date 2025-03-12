import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPENPipe } from './currency-pen.pipe';

@NgModule({
  declarations: [
    CurrencyPENPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CurrencyPENPipe
  ]
})
export class PipesModule { }
