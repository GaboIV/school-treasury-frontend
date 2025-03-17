import { Component, OnInit, OnDestroy } from '@angular/core';
import { Collection, PaginationInfo } from '../models/collection.model';
import { CollectionService } from '../services/collection.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteCollectionModalComponent } from './modals/delete-collection-modal/delete-collection-modal.component';
import { UpdateCollectionModalComponent } from './modals/update-collection-modal/update-collection-modal.component';
import { CreateCollectionModalComponent } from './modals/create-collection-modal/create-collection-modal.component';
import { PaymentListModalComponent } from './modals/payment-list-modal/payment-list-modal.component';
import { AdjustAmountModalComponent } from './modals/adjust-amount-modal/adjust-amount-modal.component';
import { ScreenSizeService } from '../services/screen-size.service';
import { Subscription } from 'rxjs';
import { UserRole } from '../../auth/services/role.service';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styles: [`
    .collection-card {
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .collection-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .collection-card.status-active {
      border-left-color: var(--bs-success);
    }

    .collection-card.status-inactive {
      border-left-color: var(--bs-danger);
    }

    .collection-cards {
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

    .collection-card {
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
export class CollectionsComponent implements OnInit, OnDestroy {
  collections: Collection[] = [];
  isLoading: boolean = false;
  error: string = '';
  isMobile: boolean = false;
  currentUser: any;
  isAdmin: boolean = false;
  isRepresentative: boolean = false;
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
    private collectionService: CollectionService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCollections();
    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );

    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser) {
      this.isAdmin = this.currentUser.roles.includes(UserRole.Administrator);
      this.isRepresentative = this.currentUser.roles.includes(UserRole.Representative);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCollections(): void {
    this.isLoading = true;
    this.collectionService.getCollections(this.pagination.currentPage, this.pagination.itemsPerPage).subscribe({
      next: (response) => {
        this.collections = response.data.items;
        this.pagination = response.data.pagination;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los tipos de cobros';
        console.error('Error al cargar los tipos de cobros:', err);
        this.isLoading = false;
      }
    });
  }

  // Métodos de paginación
  changePage(page: number): void {
    if (page !== this.pagination.currentPage && page > 0 && page <= this.pagination.totalPages) {
      this.pagination.currentPage = page;
      this.loadCollections();
    }
  }

  changePageSize(size: number): void {
    if (size !== this.pagination.itemsPerPage) {
      this.pagination.itemsPerPage = size;
      this.pagination.currentPage = 1; // Volver a la primera página al cambiar el tamaño
      this.loadCollections();
    }
  }

  openCreateModal(): void {
    const modalRef = this.modalService.open(CreateCollectionModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de crear)
        if (result) {
          // Recargar la lista de tipos de cobros
          this.loadCollections();
        }
      },
      () => {
        // Si el modal se cierra sin crear (dismiss)
      }
    );
  }

  openUpdateModal(collection: Collection): void {
    const modalRef = this.modalService.open(UpdateCollectionModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.componentInstance.collection = collection;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de actualizar)
        if (result) {
          // Recargar la lista de tipos de cobros
          this.loadCollections();
        }
      },
      () => {
        // Si el modal se cierra sin actualizar (dismiss)
      }
    );
  }

  openDeleteModal(collection: Collection): void {
    const modalRef = this.modalService.open(DeleteCollectionModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.collection = collection;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de eliminar)
        if (result) {
          // Recargar la lista de tipos de cobros
          this.loadCollections();
        }
      },
      () => {
        // Si el modal se cierra sin eliminar (dismiss)
      }
    );
  }

  openPaymentListModal(collection: Collection): void {
    const modalRef = this.modalService.open(PaymentListModalComponent, {
      size: 'xl',
      centered: false,
      scrollable: true
    });

    modalRef.componentInstance.collection = collection;

    modalRef.result.then(
      (result) => {
        // Si el resultado es true o contiene un indicador para refrescar, recargar las colecciones
        if (result === true || (typeof result === 'object' && result.refreshCollections)) {
          this.loadCollections(); // Recargar para actualizar el avance de pago
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  openAdjustAmountModal(collection: Collection): void {
    const modalRef = this.modalService.open(AdjustAmountModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.collection = collection;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de ajustar)
        if (result) {
          // Recargar la lista de cobros
          this.loadCollections();
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
