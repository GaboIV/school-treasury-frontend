import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';
import { map, catchError, tap } from 'rxjs/operators';

// const API_USERS_URL = `${environment.apiUrl}/auth`;
const API_USERS_URL = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) {}

  // public methods
  login(username: string, password: string): Observable<AuthModel> {
    console.log("AuthHTTPService: Consumiendo API real en", `${API_USERS_URL}/login`);
    return this.http.post<any>(`${API_USERS_URL}/login`, {
      username,
      password,
    }).pipe(
      tap(response => {
        console.log("AuthHTTPService: Respuesta completa del login", response);
      }),
      map(response => {
        console.log("AuthHTTPService: Respuesta recibida", response);
        const auth = new AuthModel();
        auth.authToken = response.token;
        auth.id = response.id;
        auth.username = response.username;
        auth.email = response.email || '';
        auth.fullName = response.fullName;
        auth.role = response.role;
        auth.studentId = response.studentId;

        // Establecer una fecha de expiración basada en el token
        // Por defecto, 7 días desde ahora
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + 7);
        auth.expiresIn = expiresIn;

        console.log("AuthHTTPService: Objeto auth creado", JSON.stringify(auth));
        return auth;
      })
    );
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(`${API_USERS_URL}/register`, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, {
      email,
    });
  }

  getUserByToken(token: string): Observable<UserModel | undefined> {
    console.log("AuthHTTPService: Verificando token con /me");

    const httpHeaders = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Consumir el servicio /me para verificar el token
    return this.http.get<any>(`${API_USERS_URL}/me`, { headers: httpHeaders }).pipe(
      tap(response => {
        console.log("AuthHTTPService: Respuesta completa de /me", response);
      }),
      map(response => {
        console.log("AuthHTTPService: Respuesta de /me", response);

        // Crear y configurar el modelo de usuario con la respuesta
        const user = new UserModel();
        user.id = response.id;
        user.username = response.username || '';
        user.email = response.email || '';
        user.fullname = response.fullName || '';
        user.authToken = token;

        // Asegurarse de que el rol esté configurado correctamente
        user.role = response.role;

        // Configurar el array de roles según la respuesta
        if (response.role === 2) {
          user.roles = [2]; // Administrador
        } else if (response.role === 1) {
          user.roles = [1]; // Representante
        } else {
          user.roles = [0]; // Otro rol
        }

        console.log("AuthHTTPService: Usuario configurado", JSON.stringify(user));
        console.log("AuthHTTPService: Propiedades del usuario:", {
          id: user.id,
          username: user.username,
          role: user.role,
          roles: user.roles,
          hasRoleProperty: user.hasOwnProperty('role'),
          hasRolesProperty: user.hasOwnProperty('roles'),
          roleType: typeof user.role,
          rolesType: typeof user.roles
        });

        return user;
      }),
      catchError(() => {
        // Si falla la llamada a /me, intentamos decodificar el token manualmente
        return this.getUserFromToken(token);
      })
    );
  }

  // Método auxiliar para decodificar el token JWT
  private getUserFromToken(token: string): Observable<UserModel | undefined> {
    try {
      console.log("AuthHTTPService: Intentando decodificar token manualmente");

      // Decodificar el token JWT
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("AuthHTTPService: Payload del token", payload);

        const user = new UserModel();
        user.id = payload.nameid;
        user.username = payload.unique_name || '';
        user.email = payload.email || '';
        user.fullname = payload.FullName || '';
        user.authToken = token;

        // Asegurarse de que el rol esté configurado correctamente
        if (payload.role === 'Administrator') {
          user.role = 2; // Administrador
          user.roles = [2];
        } else if (payload.role === 'Representative') {
          user.role = 1; // Representante
          user.roles = [1];
        } else {
          user.role = 0; // Otro rol
          user.roles = [0];
        }

        console.log("AuthHTTPService: Usuario configurado desde token", JSON.stringify(user));
        console.log("AuthHTTPService: Propiedades del usuario desde token:", {
          id: user.id,
          username: user.username,
          role: user.role,
          roles: user.roles,
          hasRoleProperty: user.hasOwnProperty('role'),
          hasRolesProperty: user.hasOwnProperty('roles'),
          roleType: typeof user.role,
          rolesType: typeof user.roles
        });

        return of(user);
      }
    } catch (error) {
      console.error("AuthHTTPService: Error al decodificar token", error);
    }

    return of(undefined);
  }
}
