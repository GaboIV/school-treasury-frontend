import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CollectionService } from '../../../services/collection.service';
import { Collection } from '../../../models/collection.model';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CollectionTypeService } from '../../../services/collection-type.service';
import { CollectionType } from '../../../models/collection-type.model';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-update-collection-modal',
  templateUrl: './update-collection-modal.component.html',
})
export class UpdateCollectionModalComponent implements OnInit, OnDestroy {
  @Input() collection: Collection;
  collectionForm: FormGroup;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];
  collectionTypes: CollectionType[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private collectionService: CollectionService,
    private collectionTypeService: CollectionTypeService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCollectionTypes();

    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'update-collection' },
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
    if (!state || !state.modal || state.modal !== 'update-collection') {
      // Cerrar el modal en lugar de navegar hacia atrás
      this.activeModal.dismiss('back');
      // Prevenir la navegación predeterminada
      event.preventDefault();
    }
  }

  initForm() {
    this.collectionForm = this.fb.group({
      id: [this.collection.id],
      collectionTypeId: [this.collection.collectionTypeId, [Validators.required]],
      name: [this.collection.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      totalAmount: [this.collection.totalAmount, [Validators.required]],
      studentQuantity: [this.collection.studentQuantity, [Validators.required]],
      date: [this.collection.date, [Validators.required]],
      status: [this.collection.status, [Validators.required]]
    });
  }

  loadCollectionTypes() {
    // Llama a tu servicio para obtener los tipos de cobro
    this.collectionTypeService.getAll().subscribe({
      next: (response) => {
        this.collectionTypes = response.data;
      },
      error: (error) => {
        console.error('Error al obtener los tipos de cobro:', error);
      }
    });
  }

  save() {
    if (this.collectionForm.invalid) {
      return;
    }

    this.isLoading = true;
    const collection = this.collectionForm.value;
    // Convertir el campo status en bool antes de enviar a guardar
    collection.status = collection.status === 'true';

    this.collectionService
      .updateCollection(collection)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(response.data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar el cobro:', error);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.collectionForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.collectionForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.collectionForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    return this.collectionForm.controls[controlName].touched;
  }
}
