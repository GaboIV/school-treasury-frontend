import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { UserModel } from '../../../models/user.model';
import { AuthModel } from '../../../models/auth.model';
import { UsersTable } from '../../../../../_fake/users.table';
import { environment } from '../../../../../../environments/environment';

const API_LOGIN_URL = `${environment.apiUrl}/api/v1/auth/login`;
const API_ME_URL = `${environment.apiUrl}/api/v1/auth/me`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) {}

  // public methods
  login(username: string, password: string): Observable<any> {
    console.log("AuthHTTPService: se obtendrá el login");

    const notFoundError = new Error('Not Found');
    if (!username || !password) {
      return of(notFoundError);
    }

    return this.postLogin(username, password).pipe(
      map((result: any) => {
        if (!result || (Array.isArray(result) && result.length <= 0)) {
          return notFoundError;
        }

        // Si es un objeto directo (respuesta de API real)
        const auth = new AuthModel();
        auth.authToken = result.token;
        auth.id = result.id;
        auth.username = result.username;
        auth.email = result.email || '';
        auth.fullName = result.fullName;
        auth.hasChangedPassword = result.hasChangedPassword || false;
        auth.role = result.role;
        auth.studentId = result.studentId;
        auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);

        console.log(auth);

        return auth;
      })
    );
  }

  getUserByToken(token: string): Observable<UserModel | undefined> {
    console.log("AuthHTTPService: Verificando token con /auth/me");

    // Configurar los headers con el token de autorización
    const httpHeaders = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Consumir el servicio /auth/me
    return this.http.get<any>(API_ME_URL, { headers: httpHeaders }).pipe(
      map(response => {
        console.log("AuthHTTPService: Respuesta de /auth/me", response);

        // Crear y configurar el modelo de usuario con la respuesta
        const user = new UserModel();
        user.id = response.id;
        user.username = response.username || '';
        user.email = response.email || '';
        user.fullname = response.fullName || '';
        user.studentId = response.studentId || '';
        user.hasChangedPassword = response.hasChangedPassword || false;
        user.authToken = token;

        console.log(user)

        // Configurar el rol según la respuesta
        if (response.role == 'Administrator') {
          user.roles = [0]; // Administrador
        } else if (response.role == 'Representative') {
          user.roles = [1]; // Representante
        } else {
          user.roles = [2]; // Otro rol
        }

        return user;
      }),
      catchError(error => {
        console.error("AuthHTTPService: Error al verificar token", error);
        return of(undefined);
      })
    );
  }

  postLogin(username: string, password: string): Observable<any> {
    return this.http.post<any>(API_LOGIN_URL, { username, password });
  }
}
