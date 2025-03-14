import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPaymentService } from '../../../services/student-payment.service';
import { StudentPayment } from '../../../models/student-payment.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-register-payment-modal',
  templateUrl: './register-payment-modal.component.html',
})
export class RegisterPaymentModalComponent implements OnInit {
  @Input() payment: StudentPayment;
  paymentForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';

  // Propiedades para manejo de imágenes
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  isDragging: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private studentPaymentService: StudentPaymentService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    // Usar el monto ajustado si existe, de lo contrario usar el monto individual
    const pendingAmount = this.getPendingAmount();

    this.paymentForm = this.fb.group({
      id: [this.payment.id],
      amountPaid: [0, [Validators.required, Validators.min(0.01), Validators.max(pendingAmount)]],
      comment: ['']
    });
  }

  // Método para obtener el monto pendiente considerando el monto ajustado
  getPendingAmount(): number {
    // Si hay un monto ajustado, usar ese para calcular el pendiente
    if (this.payment.adjustedAmountCollection) {
      return this.payment.adjustedAmountCollection - this.payment.amountPaid;
    }
    // De lo contrario, usar el monto individual (pendiente original)
    return this.payment.pending;
  }

  // Método para calcular el porcentaje de diferencia entre dos valores
  getPercentageDifference(originalValue: number, newValue: number): string {
    if (!originalValue || !newValue) {
      return '0';
    }

    const difference = ((newValue - originalValue) / originalValue) * 100;
    return Math.abs(difference).toFixed(1);
  }

  save() {
    if (this.paymentForm.invalid) {
      return;
    }

    this.isLoading = true;
    const paymentData = this.paymentForm.value;

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('id', paymentData.id);
    formData.append('amountPaid', paymentData.amountPaid.toString());
    formData.append('comment', paymentData.comment || '');

    // Agregar información sobre el monto ajustado si existe
    if (this.payment.adjustedAmountCollection) {
      formData.append('adjustedAmountCollection', this.payment.adjustedAmountCollection.toString());
    }

    // Agregar información sobre el excedente si existe
    if (this.payment.surplus) {
      formData.append('surplus', this.payment.surplus.toString());
    }

    // Agregar las imágenes al FormData
    this.uploadedImages.forEach((image, index) => {
      formData.append('images', image, image.name);
      console.log(`Adjuntando imagen: ${image.name}, tamaño: ${image.size} bytes, tipo: ${image.type}`);
    });

    console.log('Número total de imágenes adjuntas:', this.uploadedImages.length);

    this.studentPaymentService
      .registerPaymentWithImages(formData)
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
          this.error = 'Error al registrar el pago';
          console.error('Error al registrar el pago:', error);
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

  isDuplicate(file: File): boolean {
    return this.uploadedImages.some(existingFile =>
      existingFile.name === file.name &&
      existingFile.size === file.size &&
      existingFile.type === file.type
    );
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.paymentForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.paymentForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.paymentForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    return this.paymentForm.controls[controlName].touched;
  }
}
