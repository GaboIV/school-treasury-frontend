import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { Expense } from '../../../models/expense.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-delete-expense-modal',
  templateUrl: './delete-expense-modal.component.html',
})
export class DeleteExpenseModalComponent implements OnInit {
  @Input() expense!: Expense;
  isLoading = false;
  error = '';

  constructor(
    public activeModal: NgbActiveModal,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    // No se requiere inicialización especial
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
