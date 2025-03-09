import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-widget7',
  templateUrl: './cards-widget7.component.html',
  styleUrls: ['./cards-widget7.component.scss'],
})
export class CardsWidget7Component implements OnInit {
  @Input() cssClass: string = '';
  @Input() icon: boolean = false;
  @Input() stats: number = 25;
  @Input() description: string = 'Estudiantes';
  @Input() labelColor: string = 'dark';
  @Input() textColor: string = 'gray-300';
  items: Array<{ name: string; initials?: string; state?: string, src?: string }>;

  constructor() {}

  ngOnInit(): void {
    this.items = [
      { name: 'Alan Warden', initials: 'A', state: 'warning' },
      { name: 'Michael Eberon', initials: 'B', state: 'warning' },
      { name: 'Susan Redwood', initials: 'C', state: 'primary' },
      { name: 'Melody Macy', initials: 'F', state: 'primary' },
      { name: 'Perry Matthew', initials: 'P', state: 'danger' },
      { name: 'Barry Walter', initials: 'S', state: 'primary' },
    ];
  }
}
