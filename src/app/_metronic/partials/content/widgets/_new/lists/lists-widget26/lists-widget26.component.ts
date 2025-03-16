import { Component, Input, OnInit } from '@angular/core';
import { InterestLink } from '../../../../../../../services/dashboard.service';

@Component({
  selector: 'app-lists-widget26',
  templateUrl: './lists-widget26.component.html',
  styleUrls: ['./lists-widget26.component.scss'],
})
export class ListsWidget26Component implements OnInit {
  @Input() interestLinks: InterestLink[] = [];
  rows: Array<{ description: string, url?: string }>;

  constructor() {}

  ngOnInit(): void {
    if (this.interestLinks && this.interestLinks.length > 0) {
      // Usar los datos de la API
      this.rows = this.interestLinks.map(link => ({
        description: link.name,
        url: link.url
      }));
    } else {
      // Datos de ejemplo por defecto
      this.rows = [
        { description: 'Grupo de Whatsapp', url: 'https://whatsapp.com' },
        { description: 'Facebook Colegio', url: 'https://facebook.com' },
        { description: 'Descargar balance', url: '#' },
      ];
    }
  }
}
