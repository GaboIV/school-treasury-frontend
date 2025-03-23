import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../../modules/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
})
export class ChangePasswordModalComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(5),
        this.notEqualToCurrentPassword.bind(this)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  notEqualToCurrentPassword(control: AbstractControl): ValidationErrors | null {
    const group = control.parent;
    if (!group) return null;

    const currentPassword = group.get('currentPassword')?.value;
    const newPassword = control.value;

    if (currentPassword && newPassword && currentPassword === newPassword) {
      return { passwordMatch: true };
    }

    return null;
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordsNotMatch: true };
    }

    return null;
  }

  isControlTouched(controlName: string): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.touched || control.dirty;
  }

  controlHasError(validation: string, controlName: string): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    const formValues = this.passwordForm.value;
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Usamos la URL correcta del servicio
    const changePasswordUrl = environment.apiUrl + '/api/v1/ChangePassword';

    // Creamos el objeto con el formato requerido por el servicio
    const requestBody = {
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
      confirmPassword: formValues.confirmPassword // Añadimos este campo según la API
    };

    // Obtenemos el token de autenticación del localStorage
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      this.errorMessage = 'No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.';
      this.isLoading = false;
      return;
    }

    // Configuramos los headers con el token de autenticación
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.authToken}`
    });

    this.http.post(changePasswordUrl, requestBody, { headers }).pipe(
      tap(() => {
        this.successMessage = 'La contraseña se ha cambiado correctamente';
        setTimeout(() => {
          this.modal.close();
        }, 1500);
      }),
      catchError(error => {
        console.error('Error al cambiar la contraseña:', error);
        if (error.status === 400 && error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Sesión caducada. Por favor, inicie sesión nuevamente.';
          this.authService.logout();
        } else {
          this.errorMessage = 'Error al cambiar la contraseña. Por favor, inténtelo de nuevo.';
        }
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe();
  }

  // Función para obtener la autenticación del localStorage
  private getAuthFromLocalStorage() {
    try {
      const authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
      const lsValue = localStorage.getItem(authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }
      return JSON.parse(lsValue);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return undefined;
    }
  }
}
