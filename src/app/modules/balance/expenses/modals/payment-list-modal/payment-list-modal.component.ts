import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPaymentService } from '../../../services/student-payment.service';
import { StudentPayment, PaymentStatus } from '../../../models/student-payment.model';
import { Expense } from '../../../models/expense.model';
import { RegisterPaymentModalComponent } from '../register-payment-modal/register-payment-modal.component';
import { ImagePreviewModalComponent } from '../image-preview-modal/image-preview-modal.component';
import { ScreenSizeService } from '../../../services/screen-size.service';
import { Subscription } from 'rxjs';

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
  @Input() expense: Expense;
  payments: StudentPayment[] = [];
  isLoading: boolean = false;
  error: string = '';
  PaymentStatus = PaymentStatus;
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    public activeModal: NgbActiveModal,
    private studentPaymentService: StudentPaymentService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPayments(): void {
    if (!this.expense || !this.expense.id) {
      this.error = 'No se pudo cargar los pagos: ID de gasto no válido';
      return;
    }

    this.isLoading = true;
    this.studentPaymentService.getPaymentsByExpense(this.expense.id).subscribe({
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

  getPaymentStatusClass(status: number): string {
    switch (status) {
      case PaymentStatus.Paid:
        return 'badge-light-success';
      case PaymentStatus.Partial:
        return 'badge-light-warning';
      case PaymentStatus.Pending:
      default:
        return 'badge-light-danger';
    }
  }

  getCardStatusClass(status: number): string {
    switch (status) {
      case PaymentStatus.Paid:
        return 'status-paid';
      case PaymentStatus.Partial:
        return 'status-partial';
      case PaymentStatus.Pending:
      default:
        return 'status-pending';
    }
  }

  getPaymentStatusText(status: number): string {
    switch (status) {
      case PaymentStatus.Paid:
        return 'Pagado';
      case PaymentStatus.Partial:
        return 'Parcial';
      case PaymentStatus.Pending:
      default:
        return 'Pendiente';
    }
  }

  openRegisterPaymentModal(payment: StudentPayment): void {
    const modalRef = this.modalService.open(RegisterPaymentModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.payment = payment;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPayments();
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  openImagePreview(images: string[], index: number): void {
    const modalRef = this.modalService.open(ImagePreviewModalComponent, {
      fullscreen: true,
      centered: true,
      windowClass: 'image-preview-modal',
      backdropClass: 'image-preview-backdrop',
    });

    modalRef.componentInstance.images = images;
    modalRef.componentInstance.currentIndex = index;
  }

  getPercentageDifference(originalValue: number, newValue: number): string {
    if (!originalValue || !newValue) {
      return '0';
    }

    const difference = ((newValue - originalValue) / originalValue) * 100;
    return Math.abs(difference).toFixed(1);
  }
}
