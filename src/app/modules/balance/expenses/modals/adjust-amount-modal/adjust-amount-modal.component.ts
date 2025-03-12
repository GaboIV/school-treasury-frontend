import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Expense } from '../../../models/expense.model';
import { ExpenseService } from '../../../services/expense.service';
import { HttpErrorResponse } from '@angular/common/http';

interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
}

@Component({
  selector: 'app-adjust-amount-modal',
  templateUrl: './adjust-amount-modal.component.html',
  styleUrls: ['./adjust-amount-modal.component.scss']
})
export class AdjustAmountModalComponent implements OnInit {
  @Input() expense: Expense;
  adjustForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // Inicializar con el monto ajustado actual o el monto individual si no existe
    const currentAdjustedAmount = this.expense.adjustedIndividualAmount || this.expense.individualAmount;
    const currentSurplus = this.expense.totalSurplus || 0;

    this.adjustForm = this.fb.group({
      adjustedAmount: [currentAdjustedAmount, [Validators.required, Validators.min(0.01)]],
      surplus: [currentSurplus]
    });

    // Calcular el excedente inicial
    this.calculateSurplus();
  }

  calculateSurplus(): void {
    const adjustedAmountControl = this.adjustForm.get('adjustedAmount');
    const surplusControl = this.adjustForm.get('surplus');

    if (adjustedAmountControl && surplusControl) {
      const adjustedAmount = adjustedAmountControl.value || 0;
      const individualAmount = this.expense.individualAmount || 0;

      // El excedente es la diferencia entre el monto individual y el ajustado
      // Si el monto ajustado es menor, hay excedente positivo
      // Si el monto ajustado es mayor, no hay excedente (se establece en 0)
      const surplus = individualAmount < adjustedAmount ? Math.floor((adjustedAmount - individualAmount) * 100) / 100 : 0;

      surplusControl.setValue(surplus);
    }
  }

  isControlTouched(controlName: string): boolean {
    const control = this.adjustForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.adjustForm.get(controlName);
    return control ? control.hasError(validation) && (control.dirty || control.touched) : false;
  }

  save(): void {
    if (this.adjustForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValues = this.adjustForm.value;

    // Verificar que el ID del gasto existe
    if (!this.expense.id) {
      this.error = 'ID de gasto no válido';
      this.isLoading = false;
      return;
    }

    // Preparar los datos para actualizar
    const expenseData = {
      id: this.expense.id,
      adjustedAmount: formValues.adjustedAmount,
      surplus: formValues.surplus
    };

    this.expenseService.updateExpenseAdjustedAmount(expenseData).subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.activeModal.close(true);
        } else {
          this.error = response.message || 'Error al ajustar el monto';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Error al ajustar el monto';
        console.error('Error al ajustar el monto:', err);
      }
    });
  }
}
