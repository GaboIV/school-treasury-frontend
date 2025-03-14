import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CollectionTypeService } from '../../../services/collection-type.service';
import { CollectionType } from '../../../models/collection-type.model';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-delete-collection-type-modal',
  templateUrl: './delete-collection-type-modal.component.html',
})
export class DeleteCollectionTypeModalComponent implements OnInit {
  @Input() collectionType: CollectionType;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private collectionTypeService: CollectionTypeService
  ) {}

  ngOnInit(): void {}

  deleteCollectionType() {
    this.isLoading = true;

    this.collectionTypeService
      .deleteCollectionType(this.collectionType.id)
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
