import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPayment } from '../../../models/student-payment.model';
import { LocationStrategy } from '@angular/common';
import { RoleService } from '../../../../auth/services/role.service';
import { RegisterPaymentModalComponent } from '../../../collections/modals/register-payment-modal/register-payment-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { RequestPaymentModalComponent } from '../../../payment-requests/modals/request-payment-modal/request-payment-modal.component';

@Component({
  selector: 'app-payment-details-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ 'BALANCE.PETTY_CASH_COLLECTION' | translate }}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-4">
        <h5>{{ 'GENERAL.PAYMENT_INFORMATION' | translate }}</h5>
        <div class="d-flex flex-column">
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">{{ 'GENERAL.CONCEPT' | translate }}:</span>
            <span class="fw-bold">{{ payment.collectionName }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">{{ 'GENERAL.ORIGINAL_AMOUNT' | translate }}:</span>
            <span class="fw-bold">{{ payment.amountCollection | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2" *ngIf="payment.adjustedAmountCollection && payment.adjustedAmountCollection !== payment.amountCollection">
            <span class="text-muted">{{ 'GENERAL.ADJUSTED_AMOUNT' | translate }}:</span>
            <span class="fw-bold">{{ payment.adjustedAmountCollection | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">{{ 'GENERAL.AMOUNT_PAID' | translate }}:</span>
            <span class="fw-bold">{{ payment.amountPaid | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">{{ 'GENERAL.PENDING' | translate }}:</span>
            <span class="fw-bold">{{ payment.pending | currency: 'S/ ' }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">{{ 'GENERAL.STATUS' | translate }}:</span>
            <span class="fw-bold badge" [ngClass]="getStatusBadgeClass()">{{ getPaymentStatusText() }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span class="text-muted">{{ 'GENERAL.PAYMENT_DATE' | translate }}:</span>
            <span class="fw-bold">{{ payment.paymentDate ? (payment.paymentDate | date: 'dd/MM/yyyy') : ('GENERAL.NOT_REGISTERED' | translate) }}</span>
          </div>
        </div>
      </div>

      <div class="mb-4" *ngIf="payment.comment">
        <h5>{{ 'GENERAL.COMMENT' | translate }}</h5>
        <p class="text-muted">{{ payment.comment }}</p>
      </div>

      <div class="mb-4" *ngIf="payment.images && payment.images.length > 0">
        <h5>{{ 'GENERAL.IMAGES' | translate }}</h5>
        <div class="d-flex flex-wrap gap-2">
          <div
            *ngFor="let image of payment.images; let i = index"
            class="position-relative cursor-pointer"
            (click)="openImagePreview(payment.images, i)"
          >
            <img
              [src]="image"
              [alt]="'Image ' + (i+1)"
              class="img-fluid rounded"
              style="max-width: 150px; max-height: 150px; cursor: pointer;"
            >
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">{{ 'GENERAL.CANCEL' | translate }}</button>
      <button
        type="button"
        class="btn btn-primary"
        *ngIf="isRepresentative && isPendingPayment()"
        (click)="onRequestPayment()"
      >
        <i class="fa-solid fa-paper-plane me-1"></i>
        {{ 'MYBALANCE.REQUEST_PAYMENT_REGISTRATION' | translate }}
      </button>
      <!-- <button
        type="button"
        class="btn btn-primary"
        *ngIf="isAdmin && isPendingPayment()"
        (click)="onRegisterPayment()"
      >
        <i class="fa-solid fa-cash-register me-1"></i>
        {{ 'MYBALANCE.REGISTER_PAYMENT' | translate }}
      </button> -->
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
  isRepresentative: boolean = false;
  isAdmin: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private locationStrategy: LocationStrategy,
    private roleService: RoleService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Verificar roles de usuario
    this.isRepresentative = this.roleService.isRepresentative();
    this.isAdmin = this.roleService.isAdmin();

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
        return this.translate.instant('GENERAL.PENDING');
      case 1:
        return this.translate.instant('GENERAL.PARTIAL');
      case 2:
        return this.translate.instant('GENERAL.PAID');
      case 3:
        return this.translate.instant('GENERAL.SURPLUS');
      default:
        return this.translate.instant('GENERAL.UNKNOWN');
    }
  }

  openImagePreview(images: string[], startIndex: number): void {
    // Esta función debería abrir un modal para visualizar las imágenes
    // Pero dependerá de las funcionalidades disponibles en tu aplicación
    // Por ahora, simplemente abrimos la imagen en una nueva ventana
    window.open(images[startIndex], '_blank');
  }

  isPendingPayment(): boolean {
    // Verificar si el pago está pendiente (status 0) o parcial (status 1)
    return this.payment.paymentStatus === 0 || this.payment.paymentStatus === 1;
  }

  // Método para representantes - Solicitar registro de pago
  onRequestPayment(): void {
    // Cerrar este modal
    this.activeModal.dismiss();

    // Abrir el modal de solicitud de pago
    const modalRef = this.modalService.open(RequestPaymentModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Pasar los datos del pago al modal de solicitud
    modalRef.componentInstance.paymentData = {
      collectionId: this.payment.collectionId,
      studentId: this.payment.studentId,
      studentName: this.payment.studentName,
      collectionName: this.payment.collectionName,
      amount: this.payment.adjustedAmountCollection || this.payment.amountCollection,
      pendingAmount: this.payment.pending
    };

    // Manejar la respuesta del modal de solicitud
    modalRef.result.then(
      (result) => {
        console.log('Solicitud de pago enviada exitosamente', result);
        // Aquí podrías hacer alguna acción adicional si es necesario
      },
      (reason) => {
        console.log('Modal cerrado sin completar la solicitud', reason);
      }
    );
  }

  // Método para administradores - Registrar pago directamente
  onRegisterPayment(): void {
    // Cerrar este modal
    this.activeModal.dismiss();

    // Abrir el modal de registro de pago
    const modalRef = this.modalService.open(RegisterPaymentModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Pasar los datos del pago al modal de registro
    modalRef.componentInstance.collection = {
      id: this.payment.collectionId,
      studentId: this.payment.studentId,
      studentName: this.payment.studentName,
      name: this.payment.collectionName,
      amount: this.payment.adjustedAmountCollection || this.payment.amountCollection,
      pendingAmount: this.payment.pending
    };

    // Manejar la respuesta del modal de registro
    modalRef.result.then(
      (result) => {
        console.log('Pago registrado exitosamente', result);
      },
      (reason) => {
        console.log('Modal cerrado sin completar el registro', reason);
      }
    );
  }
}
