import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPaymentService } from '../../../services/student-payment.service';
import { StudentPayment, PaymentStatus } from '../../../models/student-payment.model';
import { first } from 'rxjs/operators';
import { LocationStrategy } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

// Interfaz para la colección que llega desde el modal de detalles de pago
export interface CollectionInfo {
  id: number;
  studentId: number;
  studentName: string;
  name: string;
  amount: number;
  pendingAmount: number;
}

@Component({
  selector: 'app-register-payment-modal',
  templateUrl: './register-payment-modal.component.html',
})
export class RegisterPaymentModalComponent implements OnInit, OnDestroy {
  @Input() payment: StudentPayment;
  @Input() collection: CollectionInfo; // Nueva propiedad para recibir datos desde PaymentDetailsModal
  @Input() isExoneration: boolean = false; // Indica si el modal es para exoneración de pago

  paymentForm: FormGroup;
  isLoading: boolean = false;
  error: string = '';

  // Propiedades para manejo de imágenes
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  isDragging: boolean = false;
  existingImages: string[] = []; // Array para almacenar las URLs de imágenes existentes

  // Propiedades para controlar cambios
  initialFormValues: any = {};
  initialImages: string[] = [];
  formChanged: boolean = false;

  // Variable para controlar el historial
  private historyState: any = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private studentPaymentService: StudentPaymentService,
    private locationStrategy: LocationStrategy,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Verificar si los datos vienen desde collection o payment
    this.initializeFromInputs();

    // Si hay un monto pendiente, siempre permitir guardar (comportamiento normal)
    if (this.getPendingAmount() > 0) {
      this.formChanged = true;
    }

    this.initForm();

    // Cargar imágenes existentes si las hay (solo si proviene de payment)
    if (this.payment?.images && this.payment.images.length > 0) {
      this.existingImages = [...this.payment.images];
      this.imagePreviewUrls = [...this.payment.images];
      this.initialImages = [...this.payment.images];
    }

    // Guardar los valores iniciales del formulario para detectar cambios
    setTimeout(() => {
      this.initialFormValues = {...this.paymentForm.value};
      console.log('Valores iniciales del formulario:', this.initialFormValues);
      this.checkFormChanges(); // Verificar cambios iniciales
    }, 0);

    // Suscribirse a los cambios del formulario
    this.paymentForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });

    // Guardar el estado actual del historial antes de modificarlo
    this.historyState = window.history.state;

    // Agregar una entrada al historial para manejar el botón de retroceso
    // Usamos un identificador único para este modal
    this.locationStrategy.pushState(
      { modal: 'register-payment' },
      '',
      window.location.pathname,
      ''
    );
  }

  // Método para inicializar propiedades según los inputs recibidos
  private initializeFromInputs() {
    // Si payment es nulo pero collection es válido, crear un objeto payment con los datos de collection
    if (!this.payment && this.collection) {
      this.payment = {
        id: '0', // Se generará al guardar
        collectionId: this.collection.id.toString(),
        studentId: this.collection.studentId.toString(),
        studentName: this.collection.studentName,
        collectionName: this.collection.name,
        amountCollection: this.collection.amount,
        amountPaid: 0,
        pending: this.collection.pendingAmount,
        paymentStatus: 0, // Pendiente
        paymentDate: null,
        paymentType: 0, // Por defecto
        images: [],
        comment: null,
        surplus: 0,
        voucher: null,
        excedent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as StudentPayment;
    }
  }

  // Manejar el evento de navegación hacia atrás
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // Verificar si el estado del evento contiene información sobre el modal anterior
    const state = window.history.state;

    // Solo cerrar este modal si el estado actual no tiene el identificador de este modal
    // o si el evento de popstate fue generado por el botón de atrás
    if (!state || !state.modal || state.modal !== 'register-payment') {
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
      const pendingAmount = this.getPendingAmount();
      const defaultAmount = pendingAmount > 0 ? pendingAmount : 0;

      let paymentDateValue: string = '';

      if (this.payment?.paymentDate) {
        const paymentDate = new Date(this.payment.paymentDate);
        paymentDateValue = paymentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        console.log('Fecha original:', this.payment.paymentDate);
        console.log('Fecha para el formulario:', paymentDateValue);
      } else {
        // Si no hay fecha de pago, usar la fecha actual
        const today = new Date();
        paymentDateValue = today.toISOString().split('T')[0];
      }

      this.paymentForm = this.fb.group({
        id: [this.payment?.id || 0],
        amountPaid: [this.isExoneration ? 0 : defaultAmount, this.isExoneration ? [] : [Validators.required, Validators.min(0), Validators.max(pendingAmount)]],
        comment: [this.payment?.comment || ''],
        paymentDate: [paymentDateValue, Validators.required]
      });

      // Si es exoneración, deshabilitamos el campo de monto
      if (this.isExoneration) {
        this.paymentForm.get('amountPaid')?.disable();
      }
  }

  // Verificar si el formulario ha cambiado
  checkFormChanges() {
    if (this.getPendingAmount() > 0) {
      // Si hay un monto pendiente, siempre permitir guardar (comportamiento normal)
      this.formChanged = true;
      return;
    }

    // Verificar cambios en el formulario
    const currentValues = this.paymentForm.value;

    // Comparar fecha
    const initialDate = this.initialFormValues.paymentDate || '';
    const currentDate = currentValues.paymentDate || '';
    const dateChanged = initialDate !== currentDate;

    // Comparar comentario
    const initialComment = this.initialFormValues.comment || '';
    const currentComment = currentValues.comment || '';
    const commentChanged = initialComment !== currentComment;

    // Verificar cambios en imágenes
    const imagesChanged = JSON.stringify(this.initialImages) !== JSON.stringify(this.existingImages) ||
                          this.uploadedImages.length > 0;

    // Actualizar el estado de cambios
    this.formChanged = dateChanged || commentChanged || imagesChanged;

    console.log('Formulario cambiado:', this.formChanged, {
      initialDate,
      currentDate,
      dateChanged,
      initialComment,
      currentComment,
      commentChanged,
      initialImages: this.initialImages,
      existingImages: this.existingImages,
      uploadedImagesLength: this.uploadedImages.length,
      imagesChanged
    });
  }

  // Método para obtener el monto pendiente considerando el monto ajustado
  getPendingAmount(): number {
    // Si hay un monto ajustado, usar ese para calcular el pendiente
    if (this.payment && this.payment.adjustedAmountCollection) {
      return this.payment.adjustedAmountCollection - this.payment.amountPaid;
    }
    // De lo contrario, usar el monto individual (pendiente original)
    return this.payment ? this.payment.pending : 0;
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
    formData.append('id', paymentData.id.toString());

    // Si es un pago completo (edición) o si hay un monto pendiente (nuevo pago)
    // Solo enviamos amountPaid si es un nuevo pago o hay monto pendiente y no es exoneración
    if (this.getPendingAmount() > 0 && !this.isExoneration) {
      formData.append('amountPaid', paymentData.amountPaid.toString());
    }

    formData.append('comment', paymentData.comment || '');

    // Formatear fecha en formato ISO
    if (paymentData.paymentDate) {
      let paymentDate: Date;
      if (typeof paymentData.paymentDate === 'string') {
        // Para el tipo de input date, necesitamos agregar la hora
        if (paymentData.paymentDate.length === 10) { // formato YYYY-MM-DD
          paymentDate = new Date(paymentData.paymentDate + 'T12:00:00');
        } else {
          paymentDate = new Date(paymentData.paymentDate);
        }
      } else {
        paymentDate = paymentData.paymentDate;
      }
      formData.append('paymentDate', paymentDate.toISOString());
      console.log('Fecha enviada al servidor:', paymentDate.toISOString());
    }

    // Si es exoneración, establecer el estado del pago como Exonerado
    if (this.isExoneration) {
      formData.append('paymentStatus', PaymentStatus.Exonerated.toString());
    }

    // Agregar información sobre el monto ajustado si existe
    if (this.payment.adjustedAmountCollection) {
      formData.append('adjustedAmountCollection', this.payment.adjustedAmountCollection.toString());
    }

    // Agregar información sobre el excedente si existe
    if (this.payment.surplus) {
      formData.append('surplus', this.payment.surplus.toString());
    }

    // Agregar las imágenes nuevas al FormData
    this.uploadedImages.forEach((image, index) => {
      formData.append('images', image, image.name);
      console.log(`Adjuntando nueva imagen: ${image.name}, tamaño: ${image.size} bytes, tipo: ${image.type}`);
    });

    // Agregar las URLs de imágenes existentes que no se eliminaron
    if (this.existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(this.existingImages));
      console.log('Imágenes existentes conservadas:', this.existingImages.length);
    }

    console.log('Número total de imágenes:', this.existingImages.length + this.uploadedImages.length);

    // Determinar qué operación realizar
    let saveOperation;

    if (this.isExoneration) {
      // Exoneración de pago
      saveOperation = this.studentPaymentService.exoneratePayment(formData, this.payment.id);
    } else if (this.getPendingAmount() > 0) {
      // Registro de pago
      saveOperation = this.studentPaymentService.registerPaymentWithImages(formData);
    } else {
      // Actualización de pago
      saveOperation = this.studentPaymentService.updatePayment(formData, this.payment.id);
    }

    saveOperation
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response && response.data) {
            // Cerrar el modal y pasar true para indicar que se debe refrescar
            this.activeModal.close({
              success: true,
              data: response.data,
              refreshCollections: true // Indicador para refrescar la pantalla de cobros
            });
          } else {
            this.activeModal.close({
              success: true,
              data: response,
              refreshCollections: true // Indicador para refrescar la pantalla de cobros
            });
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.error = this.isExoneration ? 'Error al exonerar el pago' : 'Error al registrar el pago';
          console.error(this.isExoneration ? 'Error al exonerar el pago:' : 'Error al registrar el pago:', error);
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
        this.checkFormChanges(); // Verificar cambios cuando se agregan imágenes
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
    // Verificar si es una imagen existente o una nueva
    if (index < this.existingImages.length) {
      // Es una imagen existente
      this.existingImages.splice(index, 1);
    } else {
      // Es una nueva imagen
      const newImageIndex = index - this.existingImages.length;
      this.uploadedImages.splice(newImageIndex, 1);
    }

    // Actualizar la lista de previsualizaciones
    this.imagePreviewUrls.splice(index, 1);

    // Verificar cambios después de eliminar una imagen
    this.checkFormChanges();
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
