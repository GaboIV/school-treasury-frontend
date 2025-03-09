import { Component, OnInit } from '@angular/core';
import { Expense, PaginationInfo } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteExpenseModalComponent } from './modals/delete-expense-modal/delete-expense-modal.component';
import { UpdateExpenseModalComponent } from './modals/update-expense-modal/update-expense-modal.component';
import { CreateExpenseModalComponent } from './modals/create-expense-modal/create-expense-modal.component';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html'
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
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
    private expenseService: ExpenseService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
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
