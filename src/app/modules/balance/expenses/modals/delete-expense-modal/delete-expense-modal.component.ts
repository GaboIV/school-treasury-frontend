import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { Expense } from '../../../models/expense.model';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-delete-expense-modal',
  templateUrl: './delete-expense-modal.component.html',
})
export class DeleteExpenseModalComponent implements OnInit {
  @Input() expense: Expense;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {}

  deleteExpense() {
    this.isLoading = true;

    this.expenseService
      .deleteExpense(this.expense.id!)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al eliminar el tipo de gasto:', error);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
