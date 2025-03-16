import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Collection } from '../../../models/collection.model';
import { CollectionService } from '../../../services/collection.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

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
export class AdjustAmountModalComponent implements OnInit, OnDestroy {
  @Input() collection: Collection;
  adjustForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'adjust-amount' },
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
    if (!state || !state.modal || state.modal !== 'adjust-amount') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Limpiar cualquier recurso si es necesario
  }

  initForm(): void {
    // Inicializar con el monto ajustado actual o el monto individual si no existe
    const currentAdjustedAmount = this.collection.adjustedIndividualAmount || this.collection.individualAmount;
    const currentSurplus = this.collection.totalSurplus || 0;

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
      const individualAmount = this.collection.individualAmount || 0;

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

    // Verificar que el ID del cobro existe
    if (!this.collection.id) {
      this.error = 'ID de cobro no válido';
      this.isLoading = false;
      return;
    }

    // Preparar los datos para actualizar
    const collectionData = {
      id: this.collection.id,
      adjustedAmount: formValues.adjustedAmount,
      surplus: formValues.surplus
    };

    this.collectionService.updateCollectionAdjustedAmount(collectionData).subscribe({
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
