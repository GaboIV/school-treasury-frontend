import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentRequestService, PaymentRequestDto, PaymentRequestStatus } from '../services/payment-request.service';
import { TranslationHelperService } from '../services/translation-helper.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-requests',
  templateUrl: './payment-requests.component.html',
})
export class PaymentRequestsComponent implements OnInit {
  paymentRequests: PaymentRequestDto[] = [];
  isLoading: boolean = false;

  // Filtros por estado
  pendingRequests: PaymentRequestDto[] = [];
  underReviewRequests: PaymentRequestDto[] = [];
  approvedRequests: PaymentRequestDto[] = [];
  rejectedRequests: PaymentRequestDto[] = [];
  needsChangesRequests: PaymentRequestDto[] = [];

  constructor(
    private paymentRequestService: PaymentRequestService,
    private translationHelper: TranslationHelperService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadPaymentRequests();
  }

  loadPaymentRequests(): void {
    this.isLoading = true;
    this.paymentRequestService.getAll().subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          this.paymentRequests = response.data;
          this.filterRequestsByStatus();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes de pago', error);
        this.isLoading = false;
      }
    });
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
