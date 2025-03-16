import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpenseService } from '../../../services/expense.service';
import { CollectionService } from '../../../services/collection.service';
import { Expense } from '../../../models/expense.model';
import { first } from 'rxjs/operators';
import { Collection } from '../../../models/collection.model';

@Component({
  selector: 'app-update-expense-modal',
  templateUrl: './update-expense-modal.component.html',
})
export class UpdateExpenseModalComponent implements OnInit {
  @Input() expense: Expense;
  expenseForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';
  loadingTypes: boolean = false;

  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  existingImages: { id: string; url: string }[] = [];
  isDragging: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private expenseService: ExpenseService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadExistingImages();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      id: [this.expense.id],
      name: [this.expense.name, [Validators.required]],
      amount: [this.expense.amount, [Validators.required, Validators.min(0.01)]],
      date: [this.formatDate(new Date(this.expense.date)), [Validators.required]],
      description: [this.expense.description || ''],
      status: [this.expense.status]
    });
  }

  loadExistingImages() {
    if (this.expense.images && this.expense.images.length > 0) {
      this.existingImages = [...this.expense.images];
    }
  }

  save() {
    if (this.expenseForm.invalid) {
      return;
    }

    this.isLoading = true;
    const expenseData = this.expenseForm.value;

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('id', expenseData.id);
    formData.append('name', expenseData.name);
    formData.append('expenseTypeId', expenseData.expenseTypeId);
    formData.append('amount', expenseData.amount.toString());
    formData.append('date', expenseData.date);
    formData.append('description', expenseData.description || '');
    formData.append('status', expenseData.status.toString());

    // Agregar IDs de imágenes existentes que no se eliminaron
    this.existingImages.forEach(image => {
      formData.append('existingImageIds', image.id);
    });

    // Agregar las nuevas imágenes al FormData
    this.uploadedImages.forEach((image) => {
      formData.append('images', image, image.name);
    });

    this.expenseService
      .updateExpense(formData)
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response && response.data) {
            this.activeModal.close(response.data);
          } else {
            this.activeModal.close(response);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.error = 'Error al actualizar el gasto';
          console.error('Error al actualizar el gasto:', error);
        }
      });
  }

  // Métodos para manejo de imágenes
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  addFiles(fileList: FileList) {
    // Filtrar solo archivos de imagen
    Array.from(fileList).forEach(file => {
      if (file.type.match(/image\/*/) && !this.isDuplicate(file)) {
        // Verificar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.error = `La imagen ${file.name} es demasiado grande. El tamaño máximo es 5MB.`;
          setTimeout(() => {
            this.error = '';
          }, 5000);
          return;
        }

        this.uploadedImages.push(file);
        this.createImagePreview(file);
      }
    });
  }

  createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number) {
    this.uploadedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  isDuplicate(file: File): boolean {
    return this.uploadedImages.some(existingFile =>
      existingFile.name === file.name &&
      existingFile.size === file.size &&
      existingFile.type === file.type
    );
  }

  // Formatear fecha para el input date
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
