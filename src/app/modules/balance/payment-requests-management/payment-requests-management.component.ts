import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PaymentRequestService, PaymentRequestDto, PaymentRequestStatus, ApprovePaymentRequestDto, RejectPaymentRequestDto, RequestChangesDto, AddAdminCommentDto } from '../services/payment-request.service';
import { TranslationHelperService } from '../services/translation-helper.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-requests-management',
  templateUrl: './payment-requests-management.component.html',
})
export class PaymentRequestsManagementComponent implements OnInit {
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

  onApprove(request: PaymentRequestDto): void {
    Swal.fire({
      title: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.APPROVE'),
      html: `
        <div class="mb-3">
          <label class="form-label">${this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.COMMENT')}</label>
          <textarea id="comment" class="form-control"></textarea>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.APPROVE'),
      cancelButtonText: this.translationHelper.translate('GENERAL.CANCEL'),
      preConfirm: () => {
        return {
          comment: (document.getElementById('comment') as HTMLTextAreaElement).value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const dto: ApprovePaymentRequestDto = {
          comment: result.value?.comment
        };

        this.paymentRequestService.approve(request.id, dto).subscribe({
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
            console.error('Error al aprobar solicitud', error);
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

  onReject(request: PaymentRequestDto): void {
    Swal.fire({
      title: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.REJECT'),
      html: `
        <div class="mb-3">
          <label class="form-label">${this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.COMMENT')}</label>
          <textarea id="reason" class="form-control" required></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.REJECT'),
      cancelButtonText: this.translationHelper.translate('GENERAL.CANCEL'),
      preConfirm: () => {
        const reason = (document.getElementById('reason') as HTMLTextAreaElement).value;
        if (!reason) {
          Swal.showValidationMessage(this.translationHelper.translate('VALIDATION.REQUIRED'));
          return false;
        }
        return {
          reason: reason
        };
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        const dto: RejectPaymentRequestDto = {
          reason: result.value?.reason
        };

        this.paymentRequestService.reject(request.id, dto).subscribe({
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
            console.error('Error al rechazar solicitud', error);
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

  onRequestChanges(request: PaymentRequestDto): void {
    Swal.fire({
      title: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.REQUEST_CHANGES'),
      html: `
        <div class="mb-3">
          <label class="form-label">${this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.COMMENT')}</label>
          <textarea id="reason" class="form-control" required></textarea>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.REQUEST_CHANGES'),
      cancelButtonText: this.translationHelper.translate('GENERAL.CANCEL'),
      preConfirm: () => {
        const reason = (document.getElementById('reason') as HTMLTextAreaElement).value;
        if (!reason) {
          Swal.showValidationMessage(this.translationHelper.translate('VALIDATION.REQUIRED'));
          return false;
        }
        return {
          reason: reason
        };
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        const dto: RequestChangesDto = {
          reason: result.value?.reason
        };

        this.paymentRequestService.requestChanges(request.id, dto).subscribe({
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
            console.error('Error al solicitar cambios', error);
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

  onAddComment(request: PaymentRequestDto): void {
    Swal.fire({
      title: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.ADD_COMMENT'),
      html: `
        <div class="mb-3">
          <label class="form-label">${this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.COMMENT')}</label>
          <textarea id="text" class="form-control" required></textarea>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: this.translationHelper.translate('BALANCE.PAYMENT_REQUESTS.ADD_COMMENT'),
      cancelButtonText: this.translationHelper.translate('GENERAL.CANCEL'),
      preConfirm: () => {
        const text = (document.getElementById('text') as HTMLTextAreaElement).value;
        if (!text) {
          Swal.showValidationMessage(this.translationHelper.translate('VALIDATION.REQUIRED'));
          return false;
        }
        return {
          text: text
        };
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        const dto: AddAdminCommentDto = {
          text: result.value?.text
        };

        this.paymentRequestService.addComment(request.id, dto).subscribe({
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
            console.error('Error al añadir comentario', error);
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
