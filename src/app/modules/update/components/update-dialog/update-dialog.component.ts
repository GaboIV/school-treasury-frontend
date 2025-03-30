import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UpdateInfo } from 'src/app/services/update.service';
import { UpdateService } from 'src/app/services/update.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-update-dialog',
  templateUrl: './update-dialog.component.html',
  styleUrls: ['./update-dialog.component.scss']
})
export class UpdateDialogComponent implements OnInit, OnDestroy {
  @Input() updateInfo: UpdateInfo;

  downloadProgress = 0;
  isDownloading = false;
  isInstalling = false;
  downloadStarted = false;
  downloadError: string | null = null;
  private progressSubscription: Subscription;
  private installationCheckTimeout: any;

  constructor(
    public activeModal: NgbActiveModal,
    private updateService: UpdateService
  ) { }

  ngOnInit(): void {
    // Suscribirse al progreso de descarga
    this.progressSubscription = this.updateService.downloadProgress$.subscribe(
      progress => {
        this.downloadProgress = progress;

        // Si llegamos al 95% o más, indica que estamos pasando a la fase de instalación
        if (progress >= 95 && !this.isInstalling) {
          this.isInstalling = true;
          this.downloadStarted = true;

          // Configurar un temporizador para recordarle al usuario sobre la notificación
          this.installationCheckTimeout = setTimeout(() => {
            // Si después de cierto tiempo seguimos en la misma pantalla, mostrar información
            if (this.isInstalling) {
              this.downloadError = 'La descarga ha sido iniciada. Por favor, revise la barra de notificaciones de su dispositivo para instalar el APK cuando termine la descarga.';
            }
          }, 3000);
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones y temporizadores
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }

    if (this.installationCheckTimeout) {
      clearTimeout(this.installationCheckTimeout);
    }
  }

  /**
   * Iniciar la descarga e instalación del APK
   */
  downloadAndInstall(): void {
    this.isDownloading = true;
    this.downloadError = null;
    this.downloadStarted = false;

    console.log('Iniciando descarga y actualización a la versión:', this.updateInfo.latestVersion);

    // Obtenemos la plataforma actual
    const platform = Capacitor.getPlatform();

    this.updateService.downloadAndInstallAPK(platform).subscribe({
      next: (result) => {
        if (result === true) {
          // La descarga se ha iniciado correctamente
          console.log('Descarga iniciada con el gestor de descargas del sistema');
          this.downloadProgress = 100;
          this.isInstalling = true;
          this.downloadStarted = true;

          // Mostrar mensaje informativo sobre notificación
          this.downloadError = 'La descarga ha comenzado. Una vez completada, busque la notificación en la barra de notificaciones para instalar la aplicación.';

          // Después de unos segundos, cerramos el diálogo
          setTimeout(() => {
            this.activeModal.close(true);
          }, 7000);
        }
      },
      error: (error) => {
        console.error('Error al iniciar la descarga:', error);

        // Limpiar temporizador si existe
        if (this.installationCheckTimeout) {
          clearTimeout(this.installationCheckTimeout);
        }

        let errorMessage = 'Error al iniciar la descarga.';

        // Intentar extraer un mensaje de error más específico
        if (error && typeof error === 'object') {
          if (error.message) {
            errorMessage += ' ' + error.message;
          } else if (error.toString) {
            errorMessage += ' ' + error.toString();
          }
        }

        this.downloadError = errorMessage + ' Por favor, inténtelo de nuevo.';
        this.isDownloading = false;
        this.isInstalling = false;
        this.downloadStarted = false;
      }
    });
  }

  /**
   * Cerrar el diálogo si la actualización no es obligatoria
   */
  skipUpdate(): void {
    if (!this.updateInfo.isRequired) {
      // Limpiar temporizador si existe
      if (this.installationCheckTimeout) {
        clearTimeout(this.installationCheckTimeout);
      }

      this.activeModal.close(false);
    }
  }
}
