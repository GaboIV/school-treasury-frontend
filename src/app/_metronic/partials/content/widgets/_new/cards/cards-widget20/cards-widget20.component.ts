import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-widget20',
  templateUrl: './cards-widget20.component.html',
  styleUrls: ['./cards-widget20.component.scss'],
})
export class CardsWidget20Component implements OnInit {
  @Input() cssClass: string = '';
  @Input() description: string = 'Pagos pendientes';
  @Input() color: string = '';
  @Input() img: string = '';
  @Input() pendingPayments: number = 0;
  @Input() totalPayments: number = 0;
  @Input() completionPercentage: number = 0;

  constructor() {}

  ngOnInit(): void {}
}
