import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { AuthService } from '../../auth';
import { StudentPaymentService } from '../services/student-payment.service';
import { finalize, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImagePreviewModalComponent } from '../collections/modals/image-preview-modal/image-preview-modal.component';

@Component({
  selector: 'app-my-payments',
  templateUrl: './my-payments.component.html',
  styleUrls: ['./my-payments.component.scss']
})
export class MyPaymentsComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'page d-flex flex-row flex-column-fluid';

  isLoading: boolean = false;
  payments: any[] = [];
  error: string | null = null;
  isMobile: boolean = window.innerWidth < 768;
  private subscription = new Subscription();
  private resizeObserver: ResizeObserver;

  constructor(
    private authService: AuthService,
    private paymentService: StudentPaymentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadPayments();

    // Detectar cambios en el tamaño de la ventana usando ResizeObserver
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    // Limpiar recursos
    this.subscription.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    // Comprobar si ResizeObserver está disponible
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          this.isMobile = width < 992;
        }
      });
      this.resizeObserver.observe(document.body);
    } else {
      // Fallback para navegadores que no soportan ResizeObserver
      window.addEventListener('resize', this.handleResize);
    }
  }

  private handleResize = (): void => {
    this.isMobile = window.innerWidth < 992;
  }

  loadPayments(): void {
    this.isLoading = true;
    this.error = null;

    // Obtener el ID del estudiante del usuario actual
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.studentId) {
      this.paymentService.getPaymentsByStudent(currentUser.studentId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(
          (response) => {
            if (response.success) {
              this.payments = response.data;
            } else {
              this.error = response.message || 'Error al cargar los pagos';
            }
          },
          (error) => {
            this.error = 'Error al cargar los pagos. Por favor, intente de nuevo.';
            console.error('Error cargando pagos:', error);
          }
        );
    } else {
      this.isLoading = false;
      this.error = 'No se encontró información del estudiante.';
    }
  }

  // Métodos auxiliares para presentación
  getPaymentStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pendiente';
      case 1: return 'Parcial';
      case 2: return 'Pagado';
      default: return 'Desconocido';
    }
  }

  getPaymentStatusClass(status: number): string {
    switch (status) {
      case 0: return 'badge-light-danger';
      case 1: return 'badge-light-warning';
      case 2: return 'badge-light-success';
      default: return 'badge-light-primary';
    }
  }

  getPercentageDifference(original: number, adjusted: number): number {
    if (!original || !adjusted) return 0;
    return Math.abs(Math.round(((adjusted - original) / original) * 100));
  }

  openImagePreview(images: string[], index: number): void {
    const modalRef = this.modalService.open(ImagePreviewModalComponent, {
      fullscreen: true,
      centered: true,
      windowClass: 'image-preview-modal-container',
      backdropClass: 'image-preview-backdrop',
      animation: true
    });

    modalRef.componentInstance.images = images;
    modalRef.componentInstance.initialIndex = index;
  }
}
