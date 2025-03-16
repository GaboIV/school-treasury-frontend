import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { Expense } from '../../../models/expense.model';
import { first } from 'rxjs/operators';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-delete-expense-modal',
  templateUrl: './delete-expense-modal.component.html',
})
export class DeleteExpenseModalComponent implements OnInit, OnDestroy {
  @Input() expense!: Expense;
  isLoading = false;
  error = '';

  constructor(
    public activeModal: NgbActiveModal,
    private expenseService: ExpenseService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'delete-expense' },
      '',
      window.location.pathname,
      ''
    );
  }

  // Manejar el evento de navegación hacia atrás
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // Verificar si el estado del evento contiene información sobre el modal
    const state = window.history.state;

    // Solo cerrar este modal si el estado actual no tiene el identificador de este modal
    // o si el evento de popstate fue generado por el botón de atrás
    if (!state || !state.modal || state.modal !== 'delete-expense') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Limpiar cualquier recurso si es necesario
  }

  deleteExpense(): void {
    this.isLoading = true;

    if (!this.expense.id) {
      this.error = 'ID de gasto no válido';
      this.isLoading = false;
      return;
    }

    this.expenseService.deleteExpense(this.expense.id)
      .pipe(first())
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.activeModal.close(true);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.error = error.message || 'Error al eliminar el gasto';
        }
      });
  }
}
