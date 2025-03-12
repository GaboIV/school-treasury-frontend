import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyFormatService } from '../services/currency-format.service';

@Pipe({
  name: 'currencyPEN'
})
export class CurrencyPENPipe implements PipeTransform {

  constructor(private currencyFormatService: CurrencyFormatService) {}

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return this.currencyFormatService.formatCurrency(value);
  }
}
