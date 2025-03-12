import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyFormatService {

  constructor() { }

  /**
   * Formatea un valor numérico como moneda en soles peruanos (PEN)
   * @param amount Monto a formatear
   * @returns Cadena formateada con el símbolo de sol peruano
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  }

  /**
   * Obtiene el símbolo de moneda para usar con el pipe currency de Angular
   * @returns Símbolo de sol peruano con espacio
   */
  getCurrencySymbol(): string {
    return 'S/ ';
  }
}
