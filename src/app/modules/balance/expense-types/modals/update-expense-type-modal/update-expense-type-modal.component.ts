import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseTypeService } from '../../../services/expense-type.service';
import { ExpenseType } from '../../../models/expense-type.model';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-update-expense-type-modal',
  templateUrl: './update-expense-type-modal.component.html',
})
export class UpdateExpenseTypeModalComponent implements OnInit {
  @Input() expenseType: ExpenseType;
  expenseTypeForm: FormGroup;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private expenseTypeService: ExpenseTypeService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.expenseTypeForm = this.fb.group({
      id: [this.expenseType.id],
      name: [this.expenseType.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
  }

  save() {
    if (this.expenseTypeForm.invalid) {
      return;
    }

    this.isLoading = true;
    const expenseType = this.expenseTypeForm.value;

    this.expenseTypeService
      .updateExpenseType(expenseType)
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
    const control = this.expenseTypeForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.expenseTypeForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.expenseTypeForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    return this.expenseTypeForm.controls[controlName].touched;
  }
}
