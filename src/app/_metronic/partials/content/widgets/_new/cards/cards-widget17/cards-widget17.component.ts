import { Component, Input, OnInit } from '@angular/core';
import { getCSSVariableValue } from '../../../../../../kt/_utils';
import { PettyCashSummary } from '../../../../../../../services/dashboard.service';

@Component({
  selector: 'app-cards-widget17',
  templateUrl: './cards-widget17.component.html',
  styleUrls: ['./cards-widget17.component.scss'],
})
export class CardsWidget17Component implements OnInit {
  chartOptions: any = {};

  @Input() cssClass: string = '';
  @Input() chartSize: number = 70;
  @Input() chartLine: number = 11;
  @Input() chartRotate?: number = 145;
  @Input() pettyCashSummary: PettyCashSummary | null = null;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.initChart();
    }, 10);
  }

  initChart() {
    const el = document.getElementById('kt_card_widget_17_chart');

    if (!el || !this.pettyCashSummary) {
      return;
    }

    const options = {
      size: this.chartSize,
      lineWidth: this.chartLine,
      rotate: this.chartRotate || 145,
    };

    const canvas = document.createElement('canvas');
    const span = document.createElement('span');

    // @ts-ignore
    if (typeof G_vmlCanvasManager !== 'undefined') {
      // @ts-ignore
      G_vmlCanvasManager.initElement(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.height = options.size;

    el.appendChild(span);
    el.appendChild(canvas);

    // @ts-ignore
    ctx.translate(options.size / 2, options.size / 2); // change center
    // @ts-ignore
    ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

    const radius = (options.size - options.lineWidth) / 2;

    const drawCircle = function (
      color: string,
      lineWidth: number,
      percent: number
    ) {
      percent = Math.min(Math.max(0, percent || 1), 1);
      if (!ctx) {
        return;
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
      ctx.strokeStyle = color;
      ctx.lineCap = 'round'; // butt, round or square
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Calcular los porcentajes basados en los valores reales
    const total = this.pettyCashSummary.totalIncome + this.pettyCashSummary.totalExpense;

    // Siempre dibujamos el fondo gris completo
    drawCircle('#E4E6EF', options.lineWidth, 1);

    // Solo dibujamos el gasto si hay gastos
    if (this.pettyCashSummary.totalExpense > 0 && total > 0) {
      const expensePercentage = this.pettyCashSummary.totalExpense / total;
      drawCircle(getCSSVariableValue('--bs-primary'), options.lineWidth, expensePercentage);
    }

    // Solo dibujamos los ingresos si hay ingresos
    if (this.pettyCashSummary.totalIncome > 0 && total > 0) {
      const incomePercentage = this.pettyCashSummary.totalIncome / total;
      drawCircle(getCSSVariableValue('--bs-success'), options.lineWidth, incomePercentage);
    }
  }
}
