import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPayment } from '../../../models/student-payment.model';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-payment-details-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Detalles del Pago</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-4">
        <h5>Información del Pago</h5>
        <div class="d-flex flex-column">
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Concepto:</span>
            <span class="fw-bold">{{ payment.collectionName }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Monto Original:</span>
            <span class="fw-bold">{{ payment.amountCollection | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2" *ngIf="payment.adjustedAmountCollection && payment.adjustedAmountCollection !== payment.amountCollection">
            <span class="text-muted">Monto Ajustado:</span>
            <span class="fw-bold">{{ payment.adjustedAmountCollection | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Monto Pagado:</span>
            <span class="fw-bold">{{ payment.amountPaid | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Pendiente:</span>
            <span class="fw-bold">{{ payment.pending | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Estado:</span>
            <span class="fw-bold badge" [ngClass]="getStatusBadgeClass()">{{ getPaymentStatusText() }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">Fecha de Pago:</span>
            <span class="fw-bold">{{ payment.paymentDate ? (payment.paymentDate | date: 'dd/MM/yyyy') : 'No registrado' }}</span>
          </div>
        </div>
      </div>

      <div class="mb-4" *ngIf="payment.comment">
        <h5>Comentario</h5>
        <p class="text-muted">{{ payment.comment }}</p>
      </div>

      <div class="mb-4" *ngIf="payment.images && payment.images.length > 0">
        <h5>Imágenes</h5>
        <div class="d-flex flex-wrap gap-2">
          <div
            *ngFor="let image of payment.images; let i = index"
            class="position-relative cursor-pointer"
            (click)="openImagePreview(payment.images, i)"
          >
            <img
              [src]="image"
              [alt]="'Imagen ' + (i+1)"
              class="img-fluid rounded"
              style="max-width: 150px; max-height: 150px; cursor: pointer;"
            >
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">Cerrar</button>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }

    img:hover {
      transform: scale(1.05);
      transition: transform 0.2s ease-in-out;
    }
  `]
})
export class PaymentDetailsModalComponent implements OnInit, OnDestroy {
  @Input() payment!: StudentPayment;

  constructor(
    public activeModal: NgbActiveModal,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    // Agregar una entrada al historial para manejar el botón de retroceso
    // Usamos un identificador único para este modal
    this.locationStrategy.pushState(
      { modal: 'payment-details' },
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

    // Solo cerrar este modal si el estado actual no tiene el identificador de este modal
    // o si el evento de popstate fue generado por el botón de atrás
    if (!state || !state.modal || state.modal !== 'payment-details') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  getStatusBadgeClass(): string {
    switch (this.payment.paymentStatus) {
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

  getPaymentStatusText(): string {
    switch (this.payment.paymentStatus) {
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

  openImagePreview(images: string[], startIndex: number): void {
    // Esta función debería abrir un modal para visualizar las imágenes
    // Pero dependerá de las funcionalidades disponibles en tu aplicación
    // Por ahora, simplemente abrimos la imagen en una nueva ventana
    window.open(images[startIndex], '_blank');
  }
}
