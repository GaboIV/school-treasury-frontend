import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExpenseTypeService } from '../services/expense-type.service';
import { ExpenseType, PaginationInfo } from '../models/expense-type.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateExpenseTypeModalComponent } from './modals/create-expense-type-modal/create-expense-type-modal.component';
import { UpdateExpenseTypeModalComponent } from './modals/update-expense-type-modal/update-expense-type-modal.component';
import { DeleteExpenseTypeModalComponent } from './modals/delete-expense-type-modal/delete-expense-type-modal.component';
import { ScreenSizeService } from '../services/screen-size.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-expense-types',
  templateUrl: './expense-types.component.html',
  styles: [`
    .expense-type-card {
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .expense-type-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .expense-type-card.status-active {
      border-left-color: var(--bs-success);
    }

    .expense-type-card.status-inactive {
      border-left-color: var(--bs-danger);
    }

    .expense-type-cards {
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

    .expense-type-card {
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
export class ExpenseTypesComponent implements OnInit, OnDestroy {
  expenseTypes: ExpenseType[] = [];
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
    private expenseTypeService: ExpenseTypeService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService
  ) {}

  ngOnInit(): void {
    this.loadExpenseTypes();
    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadExpenseTypes(): void {
    this.isLoading = true;
    this.expenseTypeService.getExpenseTypes(this.pagination.currentPage, this.pagination.itemsPerPage).subscribe({
      next: (response) => {
        this.expenseTypes = response.data.items;
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
      this.loadExpenseTypes();
    }
  }

  changePageSize(size: number): void {
    if (size !== this.pagination.itemsPerPage) {
      this.pagination.itemsPerPage = size;
      this.pagination.currentPage = 1; // Volver a la primera página al cambiar el tamaño
      this.loadExpenseTypes();
    }
  }

  openCreateModal(): void {
    const modalRef = this.modalService.open(CreateExpenseTypeModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de crear)
        if (result) {
          // Recargar la lista de tipos de gastos
          this.loadExpenseTypes();
        }
      },
      () => {
        // Si el modal se cierra sin crear (dismiss)
      }
    );
  }

  openUpdateModal(expenseType: ExpenseType): void {
    const modalRef = this.modalService.open(UpdateExpenseTypeModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.componentInstance.expenseType = expenseType;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de actualizar)
        if (result) {
          // Recargar la lista de tipos de gastos
          this.loadExpenseTypes();
        }
      },
      () => {
        // Si el modal se cierra sin actualizar (dismiss)
      }
    );
  }

  openDeleteModal(expenseType: ExpenseType): void {
    const modalRef = this.modalService.open(DeleteExpenseTypeModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.expenseType = expenseType;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de eliminar)
        if (result) {
          // Recargar la lista de tipos de gastos
          this.loadExpenseTypes();
        }
      },
      () => {
        // Si el modal se cierra sin eliminar (dismiss)
      }
    );
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
