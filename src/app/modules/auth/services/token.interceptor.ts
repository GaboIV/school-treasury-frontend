import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  private excludedRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Verificar si la URL de la solicitud está en la lista de rutas excluidas
    const isExcluded = this.excludedRoutes.some(route =>
      request.url.includes(route)
    );

    if (isExcluded) {
      return next.handle(request);
    }

    // Obtener el token del localStorage
    const authData = this.getAuthFromLocalStorage();

    if (authData && authData.authToken) {
      // Verificar si el token ha expirado
      if (this.isTokenExpired(authData)) {
        // Limpiar localStorage y redireccionar a login
        localStorage.removeItem(this.authLocalStorageToken);
        this.router.navigate(['/auth/login'], {
          queryParams: { expired: true }
        });
        return throwError(() => new Error('El token ha expirado. Por favor, inicie sesión nuevamente.'));
      }

      // Clonar la solicitud y añadir el encabezado de autorización
      // manteniendo los encabezados originales
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authData.authToken}`
        }
      });

      console.log(`TokenInterceptor: Añadiendo token a ${request.url}`);
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el error es 401 (Unauthorized), esto podría indicar que el token
          // es inválido o ha expirado, por lo que redirigimos al login
          if (error.status === 401) {
            localStorage.removeItem(this.authLocalStorageToken);
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
    }

    // Si no hay token, continuar con la solicitud original
    return next.handle(request);
  }

  private getAuthFromLocalStorage(): any {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      return JSON.parse(lsValue);
    } catch (error) {
      console.error('Error al obtener auth de localStorage:', error);
      return undefined;
    }
  }

  private isTokenExpired(authData: any): boolean {
    if (!authData || !authData.expiresIn) {
      return true;
    }

    const expiresIn = new Date(authData.expiresIn);
    const now = new Date();

    return now >= expiresIn;
  }
}
