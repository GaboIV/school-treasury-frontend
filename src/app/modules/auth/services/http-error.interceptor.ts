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
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('HttpErrorInterceptor: Interceptando solicitud', request.url);

    // Clonar la solicitud para agregar encabezados CORS si es necesario
    const modifiedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HttpErrorInterceptor: Error en solicitud HTTP', error);

        if (error.status === 401) {
          console.log('HttpErrorInterceptor: Error de autenticación, redirigiendo a login');
          // Redirigir a la página de login en caso de error de autenticación
          this.router.navigate(['/auth/login']);
        }

        // Propagar el error para que pueda ser manejado por los componentes
        return throwError(error);
      })
    );
  }
}
