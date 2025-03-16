import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPaymentService } from '../../../services/student-payment.service';
import { StudentPayment, PaymentStatus } from '../../../models/student-payment.model';
import { Collection } from '../../../models/collection.model';
import { RegisterPaymentModalComponent } from '../register-payment-modal/register-payment-modal.component';
import { ImagePreviewModalComponent } from '../image-preview-modal/image-preview-modal.component';
import { ScreenSizeService } from '../../../services/screen-size.service';
import { Subscription } from 'rxjs';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-payment-list-modal',
  templateUrl: './payment-list-modal.component.html',
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }

    .img-thumbnail {
      transition: transform 0.2s;
    }

    .img-thumbnail:hover {
      transform: scale(1.1);
      z-index: 5;
    }

    .payment-card {
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .payment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .payment-card.status-paid {
      border-left-color: var(--bs-success);
    }

    .payment-card.status-partial {
      border-left-color: var(--bs-warning);
    }

    .payment-card.status-pending {
      border-left-color: var(--bs-danger);
    }

    .payment-cards {
      padding-bottom: 1rem;
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

    /* Animación para las tarjetas */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .payment-card {
      animation: fadeInUp 0.3s ease forwards;
      animation-delay: calc(var(--animation-order) * 0.1s);
      opacity: 0;
    }

    /* Indicador de desplazamiento */
    .swipe-indicator {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
  `]
})
export class PaymentListModalComponent implements OnInit, OnDestroy {
  @Input() collection: Collection;
  payments: StudentPayment[] = [];
  isLoading: boolean = false;
  error: string = '';
  PaymentStatus = PaymentStatus;
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();
  refreshCollections: boolean = false;

  // Variable para controlar si hay un modal hijo abierto
  private childModalOpen: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private studentPaymentService: StudentPaymentService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(
        result => {
          this.isMobile = result;
        }
      )
    );

    this.loadPayments();

    // Agregar una entrada al historial para manejar el botón de retroceso
    // Usamos un identificador único para este modal
    this.locationStrategy.pushState(
      { modal: 'payment-list' },
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

    // Solo cerrar este modal si no hay un modal hijo abierto y
    // si el estado actual no tiene el identificador de este modal o si fue generado por el botón de atrás
    if (!this.childModalOpen && (!state || !state.modal || state.modal !== 'payment-list')) {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.closeModal();
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  closeModal() {
    // Cerrar el modal y pasar el indicador de refresco si es necesario
    this.activeModal.close(this.refreshCollections);
  }

  loadPayments(): void {
    if (!this.collection || !this.collection.id) {
      this.error = 'No se pudo cargar los pagos: ID de cobro no válido';
      return;
    }

    this.isLoading = true;
    this.studentPaymentService.getPaymentsByCollection(this.collection.id).subscribe({
      next: (response) => {
        this.payments = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pagos';
        console.error('Error al cargar los pagos:', err);
        this.isLoading = false;
      }
    });
  }

  getPaymentStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'Pendiente';
      case PaymentStatus.Partial:
        return 'Parcial';
      case PaymentStatus.Paid:
        return 'Pagado';
      case PaymentStatus.Excedent:
        return 'Excedente';
      default:
        return 'Desconocido';
    }
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'badge-light-danger';
      case PaymentStatus.Partial:
        return 'badge-light-warning';
      case PaymentStatus.Paid:
        return 'badge-light-success';
      case PaymentStatus.Excedent:
        return 'badge-light-info';
      default:
        return 'badge-light-dark';
    }
  }

  getPercentageDifference(originalValue: number, newValue: number): string {
    if (!originalValue || !newValue) {
      return '0';
    }

    const difference = ((newValue - originalValue) / originalValue) * 100;
    return Math.abs(difference).toFixed(1);
  }

  openRegisterPaymentModal(payment: StudentPayment): void {
    // Marcar que se está abriendo un modal hijo
    this.childModalOpen = true;

    const modalRef = this.modalService.open(RegisterPaymentModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.payment = payment;

    modalRef.result.then(
      (result) => {
        // Marcar que el modal hijo se ha cerrado
        this.childModalOpen = false;

        if (result) {
          // Verificar si el resultado contiene un indicador para refrescar las colecciones
          if (typeof result === 'object' && result.refreshCollections) {
            this.refreshCollections = true;
          }
          // Recargar los pagos
          this.loadPayments();
        }
      },
      () => {
        // Modal dismissed
        // Marcar que el modal hijo se ha cerrado
        this.childModalOpen = false;
      }
    );
  }

  openImagePreview(images: string[], index: number): void {
    // Marcar que se está abriendo un modal hijo
    this.childModalOpen = true;

    const modalRef = this.modalService.open(ImagePreviewModalComponent, {
      fullscreen: true,
      centered: true,
      windowClass: 'image-preview-modal-container',
      backdropClass: 'image-preview-backdrop',
      animation: true
    });

    modalRef.componentInstance.images = images;
    modalRef.componentInstance.currentIndex = index;

    modalRef.result.finally(() => {
      // Marcar que el modal hijo se ha cerrado
      this.childModalOpen = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
