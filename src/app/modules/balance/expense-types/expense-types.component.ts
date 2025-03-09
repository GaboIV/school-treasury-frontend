import { Component, OnInit } from '@angular/core';
import { ExpenseTypeService } from '../services/expense-type.service';
import { ExpenseType, PaginationInfo } from '../models/expense-type.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateExpenseTypeModalComponent } from './modals/create-expense-type-modal/create-expense-type-modal.component';
import { UpdateExpenseTypeModalComponent } from './modals/update-expense-type-modal/update-expense-type-modal.component';
import { DeleteExpenseTypeModalComponent } from './modals/delete-expense-type-modal/delete-expense-type-modal.component';

@Component({
  selector: 'app-expense-types',
  templateUrl: './expense-types.component.html',
})
export class ExpenseTypesComponent implements OnInit {
  expenseTypes: ExpenseType[] = [];
  isLoading: boolean = false;
  error: string = '';

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
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadExpenseTypes();
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
