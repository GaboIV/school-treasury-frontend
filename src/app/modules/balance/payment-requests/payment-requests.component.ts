import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentRequestService, PaymentRequestDto, PaymentRequestStatus } from '../services/payment-request.service';
import { TranslationHelperService } from '../services/translation-helper.service';
import { AuthService } from '../../auth/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImagePreviewModalComponent } from '../collections/modals/image-preview-modal/image-preview-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-requests',
  templateUrl: './payment-requests.component.html',
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }

    .card-images {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .card-image-container {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card-image-container:hover .card-image {
      transform: scale(1.1);
    }

    .more-images {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background-color: var(--bs-light);
      border-radius: 4px;
      color: var(--bs-gray);
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* Estilo para las pestañas con apariencia similar al header */
    .nav-tabs .nav-link {
      transition: color 0.2s ease, background-color 0.2s ease;
      border-bottom-width: 2px;
    }

    .nav-tabs .nav-link.active {
      border-bottom-color: var(--bs-primary);
      color: var(--bs-primary);
    }

    .nav-tabs .nav-link:hover:not(.active) {
      border-bottom-color: #e4e6ef;
      color: var(--bs-primary);
    }
  `]
})
export class PaymentRequestsComponent implements OnInit {
  paymentRequests: PaymentRequestDto[] = [];
  isLoading: boolean = false;
  activeTab: string = 'all'; // Valor por defecto para mostrar todas las solicitudes
  currentUser: any = null;
  PaymentRequestStatus = PaymentRequestStatus; // Exponer el enum al template

  // Filtros por estado
  pendingRequests: PaymentRequestDto[] = [];
  underReviewRequests: PaymentRequestDto[] = [];
  approvedRequests: PaymentRequestDto[] = [];
  rejectedRequests: PaymentRequestDto[] = [];
  needsChangesRequests: PaymentRequestDto[] = [];

  constructor(
    private paymentRequestService: PaymentRequestService,
    private translationHelper: TranslationHelperService,
    private authService: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    console.log('Usuario actual:', this.currentUser);
    this.loadPaymentRequests();
  }

  // Método para obtener la clase CSS del badge según el estado
  getStatusBadgeClass(status: PaymentRequestStatus): string {
    switch (status) {
      case PaymentRequestStatus.Pending:
        return 'badge-light-warning';
      case PaymentRequestStatus.UnderReview:
        return 'badge-light-primary';
      case PaymentRequestStatus.Approved:
        return 'badge-light-success';
      case PaymentRequestStatus.Rejected:
        return 'badge-light-danger';
      case PaymentRequestStatus.NeedsChanges:
        return 'badge-light-info';
      default:
        return 'badge-light-dark';
    }
  }

  // Método para obtener el texto del estado según el valor
  getStatusText(status: PaymentRequestStatus): string {
    switch (status) {
      case PaymentRequestStatus.Pending:
        return this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.PENDING');
      case PaymentRequestStatus.UnderReview:
        return this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.UNDER_REVIEW');
      case PaymentRequestStatus.Approved:
        return this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.APPROVED');
      case PaymentRequestStatus.Rejected:
        return this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.REJECTED');
      case PaymentRequestStatus.NeedsChanges:
        return this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.NEEDS_CHANGES');
      default:
        return 'Desconocido';
    }
  }

  // Abrir el visualizador de imágenes usando el ImagePreviewModalComponent
  openImageViewer(images: any[], index: number = 0): void {
    // Convertir a formato de URLs según sea necesario
    const imageUrls = images.map(img => {
      // Si la imagen ya es un string, devolverla directamente
      if (typeof img === 'string') {
        return img;
      }
      // Si la imagen es un objeto con propiedad url, devolver esa propiedad
      if (img && img.url) {
        return img.url;
      }
      return '';
    }).filter(url => url !== ''); // Eliminar URLs vacías

    const modalRef = this.modalService.open(ImagePreviewModalComponent, {
      size: 'xl',
      fullscreen: true,
      centered: true,
      windowClass: 'image-preview-modal',
      backdropClass: 'bg-dark bg-opacity-75',
      scrollable: false
    });

    modalRef.componentInstance.images = imageUrls;
    modalRef.componentInstance.currentIndex = index;
  }

  loadPaymentRequests(): void {
    this.isLoading = true;

    // Verificar si el usuario tiene studentId
    if (this.currentUser && this.currentUser.studentId) {
      console.log('Cargando solicitudes para el estudiante:', this.currentUser.studentId);

      // Usar el método getByStudent en lugar del getAll
      this.paymentRequestService.getByStudent(this.currentUser.studentId).subscribe({
        next: (response) => {
          if (response.data) {
            console.log("Datos de solicitudes del estudiante:", response.data);
            this.paymentRequests = response.data;
            this.filterRequestsByStatus();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar solicitudes de pago del estudiante', error);
          this.isLoading = false;
        }
      });
    } else {
      console.error('No se encontró un studentId válido para el usuario actual');
      this.isLoading = false;
    }
  }

  filterRequestsByStatus(): void {
    this.pendingRequests = this.paymentRequests.filter(
      (req) => req.status === PaymentRequestStatus.Pending
    );
    this.underReviewRequests = this.paymentRequests.filter(
      (req) => req.status === PaymentRequestStatus.UnderReview
    );
    this.approvedRequests = this.paymentRequests.filter(
      (req) => req.status === PaymentRequestStatus.Approved
    );
    this.rejectedRequests = this.paymentRequests.filter(
      (req) => req.status === PaymentRequestStatus.Rejected
    );
    this.needsChangesRequests = this.paymentRequests.filter(
      (req) => req.status === PaymentRequestStatus.NeedsChanges
    );
  }

  // Método para refrescar los datos cuando se cambia de pestaña
  refreshData(): void {
    this.loadPaymentRequests();
  }

  onView(request: PaymentRequestDto): void {
    // Implementar visualización de detalles
  }

  onEdit(request: PaymentRequestDto): void {
    // Implementar edición de solicitud
  }

  onDelete(request: PaymentRequestDto): void {
    const title = this.translationHelper.translate('GENERAL.DELETE');
    const message = this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.DELETE_CONFIRMATION');

    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translationHelper.translate('GENERAL.DELETE'),
      cancelButtonText: this.translationHelper.translate('GENERAL.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.paymentRequestService.delete(request.id).subscribe({
          next: (response) => {
            if (response && response.isSuccess) {
              Swal.fire({
                title: this.translationHelper.translate('GENERAL.SUCCESS'),
                text: response.message,
                icon: 'success',
              });
              this.loadPaymentRequests();
            } else {
              Swal.fire({
                title: this.translationHelper.translate('GENERAL.ERROR'),
                text: response.message,
                icon: 'error',
              });
            }
          },
          error: (error) => {
            console.error('Error al eliminar solicitud', error);
            Swal.fire({
              title: this.translationHelper.translate('GENERAL.ERROR'),
              text: error.message,
              icon: 'error',
            });
          }
        });
      }
    });
  }
}
