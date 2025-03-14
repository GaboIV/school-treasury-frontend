import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CollectionTypeService } from '../../../services/collection-type.service';
import { CollectionType } from '../../../models/collection-type.model';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-update-collection-type-modal',
  templateUrl: './update-collection-type-modal.component.html',
})
export class UpdateCollectionTypeModalComponent implements OnInit {
  @Input() collectionType: CollectionType;
  collectionTypeForm: FormGroup;
  isLoading: boolean = false;
  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private collectionTypeService: CollectionTypeService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.collectionTypeForm = this.fb.group({
      id: [this.collectionType.id],
      name: [this.collectionType.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
  }

  save() {
    if (this.collectionTypeForm.invalid) {
      return;
    }

    this.isLoading = true;
    const collectionType = this.collectionTypeForm.value;

    this.collectionTypeService
      .updateCollectionType(collectionType)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.activeModal.close(response.data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar el tipo de cobro:', error);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.collectionTypeForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.collectionTypeForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.collectionTypeForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string): boolean {
    return this.collectionTypeForm.controls[controlName].touched;
  }
}
