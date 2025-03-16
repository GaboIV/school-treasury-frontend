import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CollectionService } from '../../../services/collection.service';
import { Collection } from '../../../models/collection.model';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-delete-collection-modal',
  templateUrl: './delete-collection-modal.component.html',
})
export class DeleteCollectionModalComponent implements OnInit, OnDestroy {
  @Input() collection: Collection;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private collectionService: CollectionService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'delete-collection' },
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
    if (!state || !state.modal || state.modal !== 'delete-collection') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  deleteCollection() {
    this.isLoading = true;

    this.collectionService
      .deleteCollection(this.collection.id!)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al eliminar el tipo de cobro:', error);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
