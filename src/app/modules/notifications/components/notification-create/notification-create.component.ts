import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationType, NotificationRecipient } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-create',
  templateUrl: './notification-create.component.html',
  styleUrls: ['./notification-create.component.scss']
})
export class NotificationCreateComponent implements OnInit {
  notificationForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  success = '';
  notificationTypes = NotificationType;
  recipientSearchResults: NotificationRecipient[] = [];
  selectedRecipients: NotificationRecipient[] = [];
  showScheduleOptions = false;

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.notificationForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.maxLength(500)]],
      type: [NotificationType.General, Validators.required],
      recipientSearch: [''],
      isScheduled: [false],
      scheduledDate: [null]
    });

    // Observar cambios en el tipo para mostrar/ocultar opciones
    this.notificationForm.get('type')?.valueChanges.subscribe(value => {
      if (value === NotificationType.Custom) {
        this.notificationForm.get('recipientSearch')?.enable();
      } else {
        this.notificationForm.get('recipientSearch')?.disable();
        this.selectedRecipients = [];
      }
    });

    // Observar cambios en isScheduled para habilitar/deshabilitar fecha
    this.notificationForm.get('isScheduled')?.valueChanges.subscribe(value => {
      this.showScheduleOptions = value;
      if (value) {
        this.notificationForm.get('scheduledDate')?.setValidators([Validators.required]);
      } else {
        this.notificationForm.get('scheduledDate')?.clearValidators();
      }
      this.notificationForm.get('scheduledDate')?.updateValueAndValidity();
    });

    // Configurar búsqueda de destinatarios
    this.notificationForm.get('recipientSearch')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 3) {
          this.recipientSearchResults = [];
          return of([]);
        }
        return this.searchUsers(term);
      })
    ).subscribe();
  }

  searchUsers(term: string): Observable<any[]> {
    this.loading = true;
    return this.notificationService.searchUsers(term).pipe(
      tap(users => {
        this.recipientSearchResults = users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email
        }));
        this.loading = false;
      })
    );
  }

  addRecipient(recipient: NotificationRecipient): void {
    if (!this.selectedRecipients.some(r => r.id === recipient.id)) {
      this.selectedRecipients.push(recipient);
      this.notificationForm.get('recipientSearch')?.setValue('');
      this.recipientSearchResults = [];
    }
  }

  removeRecipient(recipientId: number): void {
    this.selectedRecipients = this.selectedRecipients.filter(r => r.id !== recipientId);
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    // Validar el formulario
    if (this.notificationForm.invalid) {
      return;
    }

    // Si es tipo custom, verificar que haya destinatarios
    if (this.notificationForm.get('type')?.value === NotificationType.Custom &&
        this.selectedRecipients.length === 0) {
      this.error = 'Debes seleccionar al menos un destinatario para notificaciones personalizadas.';
      return;
    }

    // Si está programada, verificar que la fecha sea futura
    if (this.notificationForm.get('isScheduled')?.value) {
      const scheduledDate = new Date(this.notificationForm.get('scheduledDate')?.value);
      if (scheduledDate <= new Date()) {
        this.error = 'La fecha de programación debe ser futura.';
        return;
      }
    }

    this.loading = true;

    // Preparar datos
    const notificationData = {
      title: this.notificationForm.get('title')?.value,
      message: this.notificationForm.get('message')?.value,
      type: this.notificationForm.get('type')?.value,
      recipientIds: this.notificationForm.get('type')?.value === NotificationType.Custom
        ? this.selectedRecipients.map(r => r.id)
        : undefined,
      scheduledDate: this.notificationForm.get('isScheduled')?.value
        ? this.notificationForm.get('scheduledDate')?.value
        : undefined
    };

    // Enviar o programar notificación
    const observable = this.notificationForm.get('isScheduled')?.value
      ? this.notificationService.scheduleNotification(notificationData)
      : this.notificationService.createNotification(notificationData);

    observable.subscribe(
      response => {
        this.loading = false;
        this.success = this.notificationForm.get('isScheduled')?.value
          ? 'Notificación programada con éxito.'
          : 'Notificación enviada con éxito.';

        // Redireccionar después de un breve tiempo
        setTimeout(() => {
          this.router.navigate(['/notifications']);
        }, 1500);
      },
      error => {
        this.loading = false;
        console.error('Error al enviar notificación:', error);
        this.error = 'No se pudo enviar la notificación. Por favor, inténtalo de nuevo.';
      }
    );
  }

  cancelar(): void {
    this.router.navigate(['/notifications']);
  }

  get f() { return this.notificationForm.controls; }
}
