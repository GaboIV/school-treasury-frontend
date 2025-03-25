import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentRequestService } from '../../../services/payment-request.service';
import { LocationStrategy } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

// Interfaz para los datos de pago que llegan desde el modal de detalles de pago
export interface PaymentDataFromDetails {
  collectionId: string;
  studentId: string;
  studentName: string;
  collectionName: string;
  amount: number;
  pendingAmount: number;
}

@Component({
  selector: 'app-request-payment-modal',
  templateUrl: './request-payment-modal.component.html',
})
export class RequestPaymentModalComponent implements OnInit {
  @Input() paymentData: PaymentDataFromDetails;

  requestForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';

  // Propiedades para manejo de imágenes
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  isDragging: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private paymentRequestService: PaymentRequestService,
    private locationStrategy: LocationStrategy,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'request-payment' },
      '',
      window.location.pathname,
      ''
    );
  }

  // Manejar el evento de navegación hacia atrás
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    const state = window.history.state;
    if (!state || !state.modal || state.modal !== 'request-payment') {
      this.activeModal.dismiss('back');
      event.preventDefault();
    }
  }

  initForm() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // formato YYYY-MM-DD

    this.requestForm = this.fb.group({
      amountPaid: [this.paymentData?.pendingAmount || 0, [
        Validators.required,
        Validators.min(0),
        Validators.max(this.paymentData?.pendingAmount || 0)
      ]],
      paymentDate: [todayStr, Validators.required],
      comment: ['']
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

  submit() {
    if (this.requestForm.invalid) {
      return;
    }

    this.isLoading = true;
    const requestData = this.requestForm.value;

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('studentId', this.paymentData.studentId);
    formData.append('collectionId', this.paymentData.collectionId);
    formData.append('amountPaid', requestData.amountPaid.toString());
    formData.append('comment', requestData.comment || '');

    // Formatear fecha en formato ISO
    if (requestData.paymentDate) {
      let paymentDate: Date;
      if (typeof requestData.paymentDate === 'string') {
        // Para el tipo de input date, necesitamos agregar la hora
        if (requestData.paymentDate.length === 10) { // formato YYYY-MM-DD
          paymentDate = new Date(requestData.paymentDate + 'T12:00:00');
        } else {
          paymentDate = new Date(requestData.paymentDate);
        }
      } else {
        paymentDate = requestData.paymentDate;
      }
      formData.append('paymentDate', paymentDate.toISOString());
    }

    // Agregar la metadata del cobro
    formData.append('collectionName', this.paymentData.collectionName);
    formData.append('totalAmount', this.paymentData.amount.toString());
    formData.append('pendingAmount', this.paymentData.pendingAmount.toString());

    // Agregar las imágenes
    this.uploadedImages.forEach((image, index) => {
      formData.append('images', image, image.name);
    });

    // Enviar la solicitud
    this.paymentRequestService.createWithImages(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.isSuccess) {
          this.activeModal.close({
            success: true,
            data: response.data,
            message: response.message
          });
        } else {
          this.error = response.message || this.translate.instant('GENERAL.ERROR_OCCURRED');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message || this.translate.instant('GENERAL.ERROR_OCCURRED');
      }
    });
  }

  // Helpers para validación del formulario
  isControlValid(controlName: string): boolean {
    const control = this.requestForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.requestForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.requestForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
}
