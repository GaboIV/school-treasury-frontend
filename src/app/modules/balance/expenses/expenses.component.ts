import { Component, OnInit, OnDestroy } from '@angular/core';
import { Expense, PaginationInfo } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteExpenseModalComponent } from './modals/delete-expense-modal/delete-expense-modal.component';
import { UpdateExpenseModalComponent } from './modals/update-expense-modal/update-expense-modal.component';
import { CreateExpenseModalComponent } from './modals/create-expense-modal/create-expense-modal.component';
import { PaymentListModalComponent } from './modals/payment-list-modal/payment-list-modal.component';
import { AdjustAmountModalComponent } from './modals/adjust-amount-modal/adjust-amount-modal.component';
import { ScreenSizeService } from '../services/screen-size.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styles: [`
    .expense-card {
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .expense-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .expense-card.status-active {
      border-left-color: var(--bs-success);
    }

    .expense-card.status-inactive {
      border-left-color: var(--bs-danger);
    }

    .expense-cards {
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

    .expense-card {
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
export class ExpensesComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  isLoading: boolean = false;
  error: string = '';
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  // Paginación
  pagination: PaginationInfo = {
    totalItems: 0,
    itemsPerPage: 50,
    currentPage: 1,
    totalPages: 0
  };
  pageSizeOptions: number[] = [50, 100, 200];

  constructor(
    private expenseService: ExpenseService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.expenseService.getExpenses(this.pagination.currentPage, this.pagination.itemsPerPage).subscribe({
      next: (response) => {
        this.expenses = response.data.items;
        this.pagination = response.data.pagination;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los tipos de gastos';
        console.error('Error al cargar los tipos de gastos:', err);
        this.isLoading = false;
      }
    });
  }

  // Métodos de paginación
  changePage(page: number): void {
    if (page !== this.pagination.currentPage && page > 0 && page <= this.pagination.totalPages) {
      this.pagination.currentPage = page;
      this.loadExpenses();
    }
  }

  changePageSize(size: number): void {
    if (size !== this.pagination.itemsPerPage) {
      this.pagination.itemsPerPage = size;
      this.pagination.currentPage = 1; // Volver a la primera página al cambiar el tamaño
      this.loadExpenses();
    }
  }

  openCreateModal(): void {
    const modalRef = this.modalService.open(CreateExpenseModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de crear)
        if (result) {
          // Recargar la lista de tipos de gastos
          this.loadExpenses();
        }
      },
      () => {
        // Si el modal se cierra sin crear (dismiss)
      }
    );
  }

  openUpdateModal(expense: Expense): void {
    const modalRef = this.modalService.open(UpdateExpenseModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de actualizar)
        if (result) {
          // Recargar la lista de tipos de gastos
          this.loadExpenses();
        }
      },
      () => {
        // Si el modal se cierra sin actualizar (dismiss)
      }
    );
  }

  openDeleteModal(expense: Expense): void {
    const modalRef = this.modalService.open(DeleteExpenseModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de eliminar)
        if (result) {
          // Recargar la lista de tipos de gastos
          this.loadExpenses();
        }
      },
      () => {
        // Si el modal se cierra sin eliminar (dismiss)
      }
    );
  }

  openPaymentListModal(expense: Expense): void {
    const modalRef = this.modalService.open(PaymentListModalComponent, {
      size: 'xl',
      centered: false,
      scrollable: true
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      () => {
        // Modal closed
        this.loadExpenses(); // Recargar para actualizar el avance de pago
      },
      () => {
        // Modal dismissed
      }
    );
  }

  openAdjustAmountModal(expense: Expense): void {
    const modalRef = this.modalService.open(AdjustAmountModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de ajustar)
        if (result) {
          // Recargar la lista de gastos
          this.loadExpenses();
        }
      },
      () => {
        // Si el modal se cierra sin ajustar (dismiss)
      }
    );
  }

  getPercentageDifference(originalValue: number, newValue: number): string {
    if (!originalValue || !newValue) {
      return '0';
    }

    const difference = ((newValue - originalValue) / originalValue) * 100;
    return Math.abs(difference).toFixed(1);
  }

  getStatusClass(status: boolean): string {
    return status ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
