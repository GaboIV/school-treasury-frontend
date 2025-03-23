import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PasswordChangeRequiredModalComponent } from '../../../../_metronic/partials/layout/modals/password-change-required-modal/password-change-required-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Credenciales por defecto
  defaultAuth: any = {
    username: null,
    password: null,
  };
  loginForm: FormGroup;
  hasError: boolean;
  errorMessage: string = 'Los datos de inicio de sesión son incorrectos';
  returnUrl: string;
  isLoading$: Observable<boolean>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: [
        this.defaultAuth.username,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    this.hasError = false;
    const username = this.f.username.value;
    const password = this.f.password.value;

    console.log("LoginComponent: Enviando credenciales", { username, password });

    const loginSubscr = this.authService
      .login(username, password)
      .pipe(first())
      .subscribe(
        (user: UserModel | undefined) => {
          if (user) {
            console.log("LoginComponent: Login exitoso, verificando estado de contraseña");

            console.log("LoginComponent: Usuario", user);
            console.log("LoginComponent: Tipo de hasChangedPassword:", typeof user.hasChangedPassword);
            console.log("LoginComponent: Valor de hasChangedPassword:", user.hasChangedPassword);

            // Verificar si el usuario necesita cambiar su contraseña
            if (user.hasChangedPassword !== true) {
              console.log("LoginComponent: El usuario necesita cambiar su contraseña");
              this.showPasswordChangeRequiredModal();
            } else {
              console.log("LoginComponent: El usuario NO necesita cambiar su contraseña");
            }

            console.log("LoginComponent: Redirigiendo a", this.returnUrl);
            // Forzar la redirección al dashboard directamente
            if (this.returnUrl === '/') {
              console.log("LoginComponent: Redirigiendo directamente al dashboard");
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate([this.returnUrl]);
            }
          } else {
            console.log("LoginComponent: Login fallido, usuario indefinido");
            this.hasError = true;
          }
        },
        (error) => {
          console.error("LoginComponent: Error en la solicitud de login", error);
          this.hasError = true;
          if (error.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
          } else {
            this.errorMessage = `Error: ${error.message || 'Desconocido'}`;
          }
        }
      );
    this.unsubscribe.push(loginSubscr);
  }

  showPasswordChangeRequiredModal() {
    console.log("LoginComponent: Mostrando modal de cambio de contraseña requerido");

    const modalRef = this.modalService.open(PasswordChangeRequiredModalComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
