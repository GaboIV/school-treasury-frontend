import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Notification, NotificationRequest, NotificationType } from '../models/notification.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadNotificationsSubject = new BehaviorSubject<number>(0);
  unreadNotifications$ = this.unreadNotificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadUnreadCount();
  }

  // Cargar contador de notificaciones no leídas
  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe(
      count => this.unreadNotificationsSubject.next(count),
      error => console.error('Error al cargar contador de notificaciones:', error)
    );
  }

  // Obtener todas las notificaciones
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}`);
  }

  // Obtener notificaciones por tipo
  getNotificationsByType(type: NotificationType): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/by-type/${type}`);
  }

  // Obtener notificaciones programadas
  getScheduledNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/scheduled`);
  }

  // Obtener una notificación específica
  getNotification(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva notificación
  createNotification(notification: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}`, notification);
  }

  // Programar una notificación
  scheduleNotification(notification: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/schedule`, notification);
  }

  // Actualizar una notificación
  updateNotification(id: number, notification: NotificationRequest): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}`, notification);
  }

  // Eliminar una notificación
  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Marcar notificación como leída
  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {})
      .pipe(
        tap(() => {
          const currentCount = this.unreadNotificationsSubject.value;
          if (currentCount > 0) {
            this.unreadNotificationsSubject.next(currentCount - 1);
          }
        })
      );
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {})
      .pipe(
        tap(() => {
          this.unreadNotificationsSubject.next(0);
        })
      );
  }

  // Obtener el contador de notificaciones no leídas
  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .pipe(
        map(response => response.count)
      );
  }

  // Buscar usuarios para envío personalizado
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/search?query=${query}`);
  }
}
