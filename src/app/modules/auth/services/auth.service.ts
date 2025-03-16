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
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(username, password).pipe(
      tap((auth: AuthModel) => {
        console.log("AuthService: Respuesta de login recibida:", auth);
      }),
      map((auth: AuthModel) => {
        const result = this.setAuthFromLocalStorage(auth);
        console.log("AuthService: Token guardado en localStorage:", result);
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
        this.isLoadingSubject.next(false);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      console.log("AuthService: No hay token en localStorage");
      return of(undefined);
    }

    console.log("AuthService: Obteniendo usuario con token:", auth.authToken);
    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      tap((user: UserType) => {
        console.log("AuthService: Usuario obtenido por token:", user);
      }),
      map((user: UserType) => {
        if (user) {
          console.log("AuthService: se validó el usuario y se continuará");
          this.currentUserSubject.next(user);
        } else {
          console.log("AuthService: Usuario no encontrado, cerrando sesión");
          this.logout();
        }
        console.log("AuthService: Retornando usuario:", user);
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
