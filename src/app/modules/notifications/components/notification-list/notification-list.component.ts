import { Component, OnInit } from '@angular/core';
import { Notification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoleService } from '../../../auth/services/role.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;
  error = '';
  selectedType: NotificationType | 'all' = 'all';
  notificationTypes = NotificationType;

  constructor(
    private notificationService: NotificationService,
    private modalService: NgbModal,
    public roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = '';

    const observable = this.selectedType === 'all'
      ? this.notificationService.getNotifications()
      : this.notificationService.getNotificationsByType(this.selectedType);

    observable.subscribe(
      data => {
        this.notifications = data;
        this.loading = false;
      },
      error => {
        console.error('Error al cargar notificaciones:', error);
        this.error = 'No se pudieron cargar las notificaciones. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }

  filterByType(type: NotificationType | 'all'): void {
    this.selectedType = type;
    this.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (notification.id && !notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(
        updatedNotification => {
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            this.notifications[index] = {...updatedNotification, isRead: true};
          }
        },
        error => {
          console.error('Error al marcar notificación como leída:', error);
        }
      );
    }
  }

  deleteNotification(notification: Notification): void {
    if (notification.id) {
      if (confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
        this.notificationService.deleteNotification(notification.id).subscribe(
          () => {
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
          },
          error => {
            console.error('Error al eliminar notificación:', error);
          }
        );
      }
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'scheduled': return 'Programada';
      case 'sent': return 'Enviada';
      case 'failed': return 'Fallida';
      default: return status;
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case NotificationType.General: return 'General';
      case NotificationType.Administrator: return 'Administradores';
      case NotificationType.Representative: return 'Representantes';
      case NotificationType.Custom: return 'Personalizada';
      default: return type;
    }
  }
}
