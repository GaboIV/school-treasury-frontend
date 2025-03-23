import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudentPayment } from '../models/student-payment.model';
import { StudentPaymentService } from '../services/student-payment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScreenSizeService } from '../services/screen-size.service';
import { Subscription } from 'rxjs';
import { UserRole } from '../../auth/services/role.service';
import { AuthService } from '../../auth';
import { PaymentDetailsModalComponent } from './modals/payment-details-modal/payment-details-modal.component';

@Component({
  selector: 'app-my-pays',
  templateUrl: './my-pays.component.html',
  styles: [`
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

    .payment-card.status-excedent {
      border-left-color: var(--bs-info);
    }

    .payment-cards {
      padding-bottom: 1rem;
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
export class MyPaysComponent implements OnInit, OnDestroy {
  payments: StudentPayment[] = [];
  isLoading: boolean = false;
  error: string = '';
  isMobile: boolean = false;
  currentUser: any;
  isRepresentative: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private studentPaymentService: StudentPaymentService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser) {
      this.isRepresentative = this.currentUser.roles.includes(UserRole.Representative);

      if (this.isRepresentative) {
        this.loadStudentPayments();
      } else {
        this.error = 'No tienes permisos para ver esta página';
      }
    }

    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadStudentPayments(): void {
    this.isLoading = true;

    // Suponiendo que el ID del estudiante está en el currentUser o en alguna propiedad relacionada
    const studentId = this.currentUser.studentId;

    if (!studentId) {
      this.error = 'No se encontró información del estudiante';
      this.isLoading = false;
      return;
    }

    this.studentPaymentService.getPaymentsByStudent(studentId).subscribe({
      next: (response) => {
        this.payments = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pagos del estudiante';
        console.error('Error al cargar los pagos:', err);
        this.isLoading = false;
      }
    });
  }

  viewPaymentDetails(payment: StudentPayment): void {
    const modalRef = this.modalService.open(PaymentDetailsModalComponent, {
      size: 'lg',
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.payment = payment;

    modalRef.result.then(
      () => {
        // No necesitamos hacer nada al cerrar el modal de detalles
      },
      () => {
        // Modal dismissed
      }
    );
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 0: // Pending
        return 'badge-light-danger';
      case 1: // Partial
        return 'badge-light-warning';
      case 2: // Paid
        return 'badge-light-success';
      case 3: // Excedent
        return 'badge-light-info';
      default:
        return 'badge-light-dark';
    }
  }

  getPaymentStatusClass(status: number): string {
    switch (status) {
      case 0: // Pending
        return 'status-pending';
      case 1: // Partial
        return 'status-partial';
      case 2: // Paid
        return 'status-paid';
      case 3: // Excedent
        return 'status-excedent';
      default:
        return '';
    }
  }

  getPaymentStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Pendiente';
      case 1:
        return 'Parcial';
      case 2:
        return 'Pagado';
      case 3:
        return 'Excedente';
      default:
        return 'Desconocido';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No registrado';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
