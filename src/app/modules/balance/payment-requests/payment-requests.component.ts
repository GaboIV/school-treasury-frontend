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
    .nav-tabs {
      border-bottom: none;
      position: relative;
    }

    .nav-tabs .nav-item {
      position: relative;
      margin-right: 0.75rem;
    }

    .nav-tabs .nav-link {
      transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
      border-bottom-width: 3px;
      border-top: none;
      border-left: none;
      border-right: none;
      padding: 0.5rem 0.25rem;
      font-weight: 600;
      margin-bottom: 0;
      color: var(--kt-gray-600);
      position: relative;
    }

    .nav-tabs .nav-link.active {
      border-bottom-color: var(--bs-primary);
      color: var(--bs-primary);
      background-color: transparent;
    }

    [data-theme="dark"] .nav-tabs .nav-link {
      color: var(--kt-gray-400);
    }

    [data-theme="dark"] .nav-tabs .nav-link.active {
      color: var(--bs-primary);
    }

    [data-theme="dark"] .nav-tabs .nav-link:hover:not(.active) {
      color: var(--kt-gray-200);
    }

    [data-theme="dark"] .table tr.bg-light th {
      background-color: var(--kt-gray-800) !important;
      color: var(--kt-gray-400) !important;
    }

    .nav-tabs .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      height: 3px;
      background-color: var(--bs-primary);
      box-shadow: 0 0 10px 0 var(--bs-primary);
    }

    .nav-tabs .nav-link:hover:not(.active) {
      border-bottom-color: #e4e6ef;
      color: var(--bs-primary);
      background-color: transparent;
    }

    /* Personalización de los badges */
    .badge-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 500;
      line-height: 1;
      padding: 0;
      min-width: 22px;
    }

    .badge-sm {
      width: 18px;
      height: 18px;
      min-width: 18px;
      font-size: 0.65rem;
    }

    .nav-tabs .nav-link .badge {
      transition: all 0.3s ease;
    }

    /* Efecto al hacer hover sobre los badges */
    .nav-tabs .nav-link:hover .badge {
      transform: translateY(-2px);
    }

    /* Sombra en los badges activos */
    .nav-tabs .nav-link.active .badge {
      box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
    }

    /* Estilos para la vista móvil */
    .scrollable-tabs {
      overflow-x: auto;
      flex-wrap: nowrap;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
      padding-bottom: 5px;
    }

    .scrollable-tabs::-webkit-scrollbar {
      height: 0;
      width: 0;
      display: none;
    }

    /* Estilos para las tarjetas en móvil */
    .request-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Adaptación al tema oscuro para tarjetas y filtros */
    [data-theme="dark"] .payment-request-card {
      background-color: var(--kt-card-bg);
      border-color: var(--kt-card-border-color);
    }
    
    [data-theme="dark"] .filter-item {
      background-color: var(--kt-card-bg);
      color: var(--kt-gray-400);
    }
    
    [data-theme="dark"] .filter-item:not(.active):hover {
      background-color: var(--kt-gray-800);
      color: var(--kt-gray-200);
    }
    
    [data-theme="dark"] .filter-item.active .filter-title {
      color: #ffffff;
    }
    
    [data-theme="dark"] .filter-item.active {
      background-color: var(--bs-primary);
    }
    
    [data-theme="dark"] .badge.bg-light {
      background-color: var(--kt-gray-700) !important;
      color: var(--kt-gray-200) !important;
    }

    [data-theme="dark"] .more-images {
      background-color: var(--kt-gray-700) !important;
      color: var(--kt-gray-400) !important;
    }

    [data-theme="dark"] .btn-light {
      background-color: var(--kt-gray-800) !important;
      border-color: var(--kt-gray-700) !important;
      color: var(--kt-gray-400) !important;
    }

    [data-theme="dark"] .btn-light:hover {
      background-color: var(--kt-gray-700) !important;
      color: var(--kt-gray-200) !important;
    }

    [data-theme="dark"] .text-dark,
    [data-theme="dark"] .card-title {
      color: var(--kt-gray-300) !important;
    }

    [data-theme="dark"] .text-muted {
      color: var(--kt-gray-500) !important;
    }

    .payment-request-card {
      border-radius: 0.75rem;
      box-shadow: 0 0.1rem 1rem 0.25rem rgba(0, 0, 0, 0.05);
      border: none;
      transition: transform 0.3s ease;
      animation: slideIn 0.3s ease forwards;
      animation-delay: calc(var(--animation-order) * 0.05s);
      opacity: 0;
      transform: translateY(20px);
    }

    @keyframes slideIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .payment-request-card:hover {
      transform: translateY(-5px);
    }

    /* Borde de color según el estado */
    .card-status-pending {
      border-left: 4px solid var(--bs-warning);
    }

    .card-status-under-review {
      border-left: 4px solid var(--bs-primary);
    }

    .card-status-approved {
      border-left: 4px solid var(--bs-success);
    }

    .card-status-rejected {
      border-left: 4px solid var(--bs-danger);
    }

    .card-status-needs-changes {
      border-left: 4px solid var(--bs-info);
    }

    /* Indicador de desplazamiento */
    .swipe-indicator {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
      40% {transform: translateY(-10px);}
      60% {transform: translateY(-5px);}
    }

    /* Estilos para la matriz de filtros */
    .filter-grid {
      margin-bottom: 1rem;
    }

    .filter-item {
      display: block;
      padding: 0.75rem 0.8rem;
      border-radius: 0.5rem;
      background-color: #f5f8fa;
      transition: all 0.3s ease;
      text-align: left;
      text-decoration: none;
      height: 100%;
    }

    .filter-item.active {
      background-color: var(--bs-primary);
      color: white;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
    }

    .filter-item:not(.active):hover {
      background-color: #eef3f7;
      transform: translateY(-2px);
    }

    .filter-title {
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      color: inherit;
      max-width: calc(100% - 30px);
    }

    .filter-item.active .filter-title {
      color: white;
    }

    .filter-item .badge {
      font-size: 0.8rem;
      font-weight: 400;
      transition: all 0.3s ease;
    }

    .filter-item.active .badge {
      background-color: rgba(255, 255, 255, 0.25) !important;
      color: white !important;
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

  // Método para obtener la clase CSS de la tarjeta según el estado
  getStatusCardClass(status: PaymentRequestStatus): string {
    switch (status) {
      case PaymentRequestStatus.Pending:
        return 'card-status-pending';
      case PaymentRequestStatus.UnderReview:
        return 'card-status-under-review';
      case PaymentRequestStatus.Approved:
        return 'card-status-approved';
      case PaymentRequestStatus.Rejected:
        return 'card-status-rejected';
      case PaymentRequestStatus.NeedsChanges:
        return 'card-status-needs-changes';
      default:
        return '';
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
            // Actualizar los filtros por estado
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
    // Actualizar los arrays filtrados
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

    console.log('Total de solicitudes:', this.paymentRequests.length);
    console.log('Solicitudes pendientes:', this.pendingRequests.length);
    console.log('Solicitudes en revisión:', this.underReviewRequests.length);
    console.log('Solicitudes aprobadas:', this.approvedRequests.length);
    console.log('Solicitudes rechazadas:', this.rejectedRequests.length);
    console.log('Solicitudes que necesitan cambios:', this.needsChangesRequests.length);
  }

  // Método para refrescar los datos cuando se cambia de pestaña
  refreshData(): void {
    // Si estamos filtrando por estado, no es necesario cargar los datos nuevamente
    if (this.activeTab !== 'all') {
      this.filterRequestsByStatus();
    } else {
      this.loadPaymentRequests();
    }
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
