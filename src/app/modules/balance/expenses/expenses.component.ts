import { Component, OnInit, OnDestroy } from '@angular/core';
import { Expense, PaginationInfo } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScreenSizeService } from '../services/screen-size.service';
import { Subscription } from 'rxjs';
import { CreateExpenseModalComponent } from './modals/create-expense-modal/create-expense-modal.component';
import { UpdateExpenseModalComponent } from './modals/update-expense-modal/update-expense-modal.component';
import { DeleteExpenseModalComponent } from './modals/delete-expense-modal/delete-expense-modal.component';
import { ImagePreviewModalComponent } from '../collections/modals/image-preview-modal/image-preview-modal.component';

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
        this.error = 'Error al cargar los gastos';
        console.error('Error al cargar los gastos:', err);
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
    // Implementar cuando se creen los componentes modales
    const modalRef = this.modalService.open(CreateExpenseModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadExpenses();
        }
      },
      () => {}
    );
  }

  openUpdateModal(expense: Expense): void {
    // Implementar cuando se creen los componentes modales
    const modalRef = this.modalService.open(UpdateExpenseModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadExpenses();
        }
      },
      () => {}
    );
  }

  openDeleteModal(expense: Expense): void {
    // Implementar cuando se creen los componentes modales
    const modalRef = this.modalService.open(DeleteExpenseModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadExpenses();
        }
      },
      () => {}
    );
  }

  getImageUrls(images: { id: string; url: string }[]): string[] {
    if (!images || images.length === 0) {
      return [];
    }
    return images.map(image => image.url);
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
    modalRef.componentInstance.currentIndex = index;
  }

  getPercentageDifference(originalValue: number, newValue: number): string {
    if (originalValue === 0) return '0';
    const difference = Math.abs(((newValue - originalValue) / originalValue) * 100);
    return difference.toFixed(2);
  }

  getStatusClass(status: boolean): string {
    return status ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
