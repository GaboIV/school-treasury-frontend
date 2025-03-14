import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CollectionService } from '../../../services/collection.service';
import { Collection } from '../../../models/collection.model';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-delete-collection-modal',
  templateUrl: './delete-collection-modal.component.html',
})
export class DeleteCollectionModalComponent implements OnInit {
  @Input() collection: Collection;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {}

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
