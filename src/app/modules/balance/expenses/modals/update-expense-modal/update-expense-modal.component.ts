import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { Expense } from '../../../models/expense.model';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ExpenseTypeService } from '../../../services/expense-type.service';
import { ExpenseType } from '../../../models/expense-type.model';

@Component({
  selector: 'app-update-expense-modal',
  templateUrl: './update-expense-modal.component.html',
})
export class UpdateExpenseModalComponent implements OnInit {
  @Input() expense: Expense;
  expenseForm: FormGroup;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];
  expenseTypes: ExpenseType[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private expenseService: ExpenseService,
    private expenseTypeService: ExpenseTypeService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExpenseTypes();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      id: [this.expense.id],
      expenseTypeId: [this.expense.expenseTypeId, [Validators.required]],
      name: [this.expense.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      totalAmount: [this.expense.totalAmount, [Validators.required]],
      studentQuantity: [this.expense.studentQuantity, [Validators.required]],
      date: [this.expense.date, [Validators.required]],
      status: [this.expense.status, [Validators.required]]
    });
  }

  loadExpenseTypes() {
    // Llama a tu servicio para obtener los tipos de gasto
    this.expenseTypeService.getAll().subscribe({
      next: (response) => {
        this.expenseTypes = response.data;
      },
      error: (error) => {
        console.error('Error al obtener los tipos de gasto:', error);
      }
    });
  }

  save() {
    if (this.expenseForm.invalid) {
      return;
    }

    this.isLoading = true;
    const expense = this.expenseForm.value;

    this.expenseService
      .updateExpense(expense)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(response.data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar el tipo de gasto:', error);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.expenseForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.expenseForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.expenseForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    return this.expenseForm.controls[controlName].touched;
  }
}
