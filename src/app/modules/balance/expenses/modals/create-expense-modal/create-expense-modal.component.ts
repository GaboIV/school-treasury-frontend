import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ExpenseTypeService } from '../../../services/expense-type.service';
import { ExpenseType } from '../../../models/expense-type.model';

@Component({
  selector: 'app-create-expense-modal',
  templateUrl: './create-expense-modal.component.html',
})
export class CreateExpenseModalComponent implements OnInit {
  expenseForm: FormGroup;
  isLoading$: Observable<boolean>;
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
      expenseTypeId: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      totalAmount: [null, [Validators.required]],
      studentQuantity: ['all', [Validators.required]],
      date: [null, [Validators.required]],
      status: [true, [Validators.required]]
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
      .createExpense(expense)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(response.data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al crear el gasto:', error);
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
