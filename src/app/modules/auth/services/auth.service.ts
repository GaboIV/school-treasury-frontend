import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login(username: string, password: string): Observable<UserType> {
    console.log("AuthService: Iniciando login con username:", username);
    // Obtener el token FCM del localStorage
    const fcmToken = localStorage.getItem('fcm_token') || '';
    console.log("AuthService: FCM Token para login:", fcmToken);

    this.isLoadingSubject.next(true);
    return this.authHttpService.login(username, password, fcmToken).pipe(
      tap((auth: AuthModel) => {
        console.log("AuthService: Respuesta de login recibida:", auth);
        console.log("AuthService: hasChangedPassword en respuesta de login:", auth.hasChangedPassword);
        console.log("AuthService: Tipo de hasChangedPassword:", typeof auth.hasChangedPassword);
      }),
      map((auth: AuthModel) => {
        // Asegurarse de que hasChangedPassword esté explícitamente definido
        if (auth.hasChangedPassword === true) {
          console.log("AuthService: Conservando hasChangedPassword=true del login");
        } else {
          console.log("AuthService: Estableciendo hasChangedPassword=false en auth");
          auth.hasChangedPassword = false;
        }

        const result = this.setAuthFromLocalStorage(auth);
        console.log("AuthService: Token guardado en localStorage:", result);

        // Verificar que se guardó correctamente en localStorage
        const savedAuth = this.getAuthFromLocalStorage();
        if (savedAuth) {
          console.log("AuthService: hasChangedPassword en localStorage:", savedAuth.hasChangedPassword);
        }

        return result;
      }),
      switchMap(() => {
        console.log("AuthService: Obteniendo usuario por token");
        return this.getUserByToken();
      }),
      catchError((err) => {
        console.error('AuthService: Error en login:', err);
        return of(undefined);
      }),
      finalize(() => {
        console.log("AuthService: Finalizando proceso de login");
        console.log("AuthService: Usuario después de login", this.currentUserValue);
        if (this.currentUserValue) {
          console.log("AuthService: hasChangedPassword final:", this.currentUserValue.hasChangedPassword);
        }
        this.isLoadingSubject.next(false);
      })
    );
  }

  logout() {
    console.log("AuthService: Cerrando sesión");
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  getUserRoles(){
    var currentUser = this.currentUserValue;

    console.log("Muestro a usuario ", currentUser)

    if (currentUser) {
      console.log("Devuelvo roles de usuario ", currentUser.roles)
      return currentUser.roles;
    }
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      console.log("AuthService: No hay token en localStorage");
      return of(undefined);
    }

    console.log("AuthService: Obteniendo usuario con token:", auth.authToken);
    console.log("AuthService: Valor de hasChangedPassword en auth:", auth.hasChangedPassword);

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      tap((user: UserType) => {
        console.log("AuthService: Usuario obtenido por token:", user);
        if (user) {
          console.log("AuthService: hasChangedPassword del usuario obtenido:", user.hasChangedPassword);
        }
      }),
      map((user: UserType) => {
        if (user) {
          console.log("AuthService: se validó el usuario y se continuará");

          // Convertir el rol de string a número si es necesario
          if (typeof user.role === 'string') {
            console.log("AuthService: El rol es un string:", user.role);
            // Mapear el string del rol a su valor numérico correspondiente
            if (user.role === 'Administrator') {
              console.log("AuthService: Convirtiendo rol 'Administrator' a 0");
              user.role = 0;
            } else if (user.role === 'Representative') {
              console.log("AuthService: Convirtiendo rol 'Representative' a 1");
              user.role = 1;
            } else {
              console.log("AuthService: Rol desconocido, asignando rol por defecto (0)");
              user.role = 0;
            }
          }
          // Si el rol sigue siendo undefined, asignar un valor por defecto
          else if (user.role === undefined) {
            console.log("AuthService: El usuario no tiene un rol definido, asignando rol por defecto (0)");
            user.role = 0; // Asignar rol de Administrador por defecto
          }

          // Asegurarse de que el usuario tenga un array de roles
          if (!Array.isArray(user.roles)) {
            console.log("AuthService: El usuario no tiene un array de roles, creando uno con el rol actual");
            user.roles = [user.role];
          }

          // CLAVE: Si hasChangedPassword está en el auth del localStorage y es true,
          // siempre lo respetamos y usamos ese valor
          if (auth.hasChangedPassword === true) {
            console.log("AuthService: Sobreescribiendo hasChangedPassword con el valor true del localStorage");
            user.hasChangedPassword = true;
          }
          // Si en localStorage es false o undefined, revisamos si viene del API
          else if (user.hasChangedPassword === true) {
            console.log("AuthService: Conservando hasChangedPassword=true del API");
            // Si el usuario tiene hasChangedPassword=true, actualizamos también el localStorage
            auth.hasChangedPassword = true;
            this.setAuthFromLocalStorage(auth);
            console.log("AuthService: Actualizado hasChangedPassword=true en localStorage");
          } else {
            console.log("AuthService: Estableciendo hasChangedPassword=false (valor por defecto)");
            user.hasChangedPassword = false;
          }

          this.currentUserSubject.next(user);
        } else {
          console.log("AuthService: Usuario no encontrado, cerrando sesión");
          this.logout();
        }
        console.log("AuthService: Retornando usuario:", user);
        if (user) {
          console.log("AuthService: hasChangedPassword final:", user.hasChangedPassword);
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
