import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseTypeService } from '../../../services/expense-type.service';
import { ExpenseType } from '../../../models/expense-type.model';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-delete-expense-type-modal',
  templateUrl: './delete-expense-type-modal.component.html',
})
export class DeleteExpenseTypeModalComponent implements OnInit {
  @Input() expenseType: ExpenseType;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private expenseTypeService: ExpenseTypeService
  ) {}

  ngOnInit(): void {}

  deleteExpenseType() {
    this.isLoading = true;

    this.expenseTypeService
      .deleteExpenseType(this.expenseType.id)
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
