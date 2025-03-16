import { Component, Input, OnInit } from '@angular/core';
import { StudentInitial } from '../../../../../../../services/dashboard.service';

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
  @Input() studentInitials: StudentInitial[] = [];
  items: Array<{ name: string; initials?: string; state?: string, src?: string }>;

  constructor() {}

  ngOnInit(): void {
    if (this.studentInitials && this.studentInitials.length > 0) {
      // Usar los datos de la API
      this.items = this.studentInitials.slice(0, 6).map(student => ({
        name: student.name,
        initials: student.initial,
        state: this.getRandomState()
      }));
    } else {
      // Datos de ejemplo por defecto
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

  private getRandomState(): string {
    const states = ['primary', 'success', 'info', 'warning', 'danger'];
    const randomIndex = Math.floor(Math.random() * states.length);
    return states[randomIndex];
  }
}
