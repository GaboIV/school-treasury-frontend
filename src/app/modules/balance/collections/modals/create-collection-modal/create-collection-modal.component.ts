import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CollectionService } from '../../../services/collection.service';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CollectionTypeService } from '../../../services/collection-type.service';
import { CollectionType } from '../../../models/collection-type.model';

@Component({
  selector: 'app-create-collection-modal',
  templateUrl: './create-collection-modal.component.html',
})
export class CreateCollectionModalComponent implements OnInit {
  collectionForm: FormGroup;
  isLoading$: Observable<boolean>;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];
  collectionTypes: CollectionType[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private collectionService: CollectionService,
    private collectionTypeService: CollectionTypeService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCollectionTypes();
  }

  initForm() {
    this.collectionForm = this.fb.group({
      collectionTypeId: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      totalAmount: [null, [Validators.required]],
      studentQuantity: ['all', [Validators.required]],
      date: [null, [Validators.required]],
      status: [true, [Validators.required]]
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

    this.collectionService
      .createCollection(collection)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(response.data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al crear el cobro:', error);
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
