import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { CollectionService } from '../../../services/collection.service';
import { CollectionType } from '../../../models/collection-type.model';
import { first } from 'rxjs/operators';
import { CollectionTypeService } from '../../../services/collection-type.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-create-expense-modal',
  templateUrl: './create-expense-modal.component.html',
})
export class CreateExpenseModalComponent implements OnInit, OnDestroy {
  expenseForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';

  // Propiedades para manejo de imágenes
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  isDragging: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private expenseService: ExpenseService,
    private collectionService: CollectionService,
    private collectionTypeService: CollectionTypeService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'create-expense' },
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
    if (!state || !state.modal || state.modal !== 'create-expense') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Limpiar cualquier recurso si es necesario
  }

  initForm() {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      date: [this.formatDate(new Date()), [Validators.required]],
      description: [''],
      status: [true]
    });
  }

  save() {
    if (this.expenseForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    const formValues = this.expenseForm.value;
    formData.append('name', formValues.name);
    formData.append('amount', formValues.amount.toString()); // Convertir a string
    formData.append('date', new Date(formValues.date).toISOString()); // Convertir fecha a ISO
    formData.append('description', formValues.description ?? ''); // Evitar valores nulos
    formData.append('status', formValues.status ? 'true' : 'false'); // Convertir booleano a string

    // Agregar imágenes
    this.uploadedImages.forEach((file) => {
      formData.append('images', file);
    });

    this.expenseService.createExpense(formData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.activeModal.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.message || 'Error al crear el gasto';
        }
      });
  }

  // Métodos para manejo de imágenes
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        this.uploadedImages.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        this.error = 'Solo se permiten imágenes de hasta 5MB';
      }
    });
  }

  removeImage(index: number) {
    this.uploadedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  // Métodos para validación de formulario
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

  // Formatear fecha para el input date
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
