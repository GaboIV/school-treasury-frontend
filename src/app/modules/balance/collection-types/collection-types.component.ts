import { Component, OnInit, OnDestroy } from '@angular/core';
import { CollectionTypeService } from '../services/collection-type.service';
import { CollectionType, PaginationInfo } from '../models/collection-type.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCollectionTypeModalComponent } from './modals/create-collection-type-modal/create-collection-type-modal.component';
import { UpdateCollectionTypeModalComponent } from './modals/update-collection-type-modal/update-collection-type-modal.component';
import { DeleteCollectionTypeModalComponent } from './modals/delete-collection-type-modal/delete-collection-type-modal.component';
import { ScreenSizeService } from '../services/screen-size.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collection-types',
  templateUrl: './collection-types.component.html',
  styles: [`
    .collection-type-card {
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .collection-type-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .collection-type-card.status-active {
      border-left-color: var(--bs-success);
    }

    .collection-type-card.status-inactive {
      border-left-color: var(--bs-danger);
    }

    .collection-type-cards {
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

    .collection-type-card {
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
export class CollectionTypesComponent implements OnInit, OnDestroy {
  collectionTypes: CollectionType[] = [];
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
    private collectionTypeService: CollectionTypeService,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService
  ) {}

  ngOnInit(): void {
    this.loadCollectionTypes();
    this.subscription.add(
      this.screenSizeService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCollectionTypes(): void {
    this.isLoading = true;
    this.collectionTypeService.getCollectionTypes(this.pagination.currentPage, this.pagination.itemsPerPage).subscribe({
      next: (response) => {
        this.collectionTypes = response.data.items;
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
      this.loadCollectionTypes();
    }
  }

  changePageSize(size: number): void {
    if (size !== this.pagination.itemsPerPage) {
      this.pagination.itemsPerPage = size;
      this.pagination.currentPage = 1; // Volver a la primera página al cambiar el tamaño
      this.loadCollectionTypes();
    }
  }

  openCreateModal(): void {
    const modalRef = this.modalService.open(CreateCollectionTypeModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de crear)
        if (result) {
          // Recargar la lista de tipos de cobros
          this.loadCollectionTypes();
        }
      },
      () => {
        // Si el modal se cierra sin crear (dismiss)
      }
    );
  }

  openUpdateModal(collectionType: CollectionType): void {
    const modalRef = this.modalService.open(UpdateCollectionTypeModalComponent, {
      size: 'lg',
      centered: false,
    });

    modalRef.componentInstance.collectionType = collectionType;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de actualizar)
        if (result) {
          // Recargar la lista de tipos de cobros
          this.loadCollectionTypes();
        }
      },
      () => {
        // Si el modal se cierra sin actualizar (dismiss)
      }
    );
  }

  openDeleteModal(collectionType: CollectionType): void {
    const modalRef = this.modalService.open(DeleteCollectionTypeModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.collectionType = collectionType;

    modalRef.result.then(
      (result) => {
        // Si el modal se cierra con éxito (después de eliminar)
        if (result) {
          // Recargar la lista de tipos de cobros
          this.loadCollectionTypes();
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
