import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UpdateInfo } from 'src/app/services/update.service';
import { UpdateService } from 'src/app/services/update.service';

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
              this.downloadError = 'La descarga ha sido iniciada. Por favor, revise la barra de notificaciones de su dispositivo para instalar cuando termine la descarga.';
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
   * Iniciar la descarga e instalación directamente desde la URL proporcionada
   */
  downloadAndInstall(): void {
    this.isDownloading = true;
    this.downloadError = null;
    this.downloadStarted = false;

    console.log('Iniciando descarga desde URL:', this.updateInfo.downloadUrl);

    try {
      // Redireccionamos directamente a la URL de descarga
      window.open(this.updateInfo.downloadUrl, '_blank');

      // Simulamos progreso para la interfaz de usuario
      this.simulateDownloadProgress();

      // Consideramos esto como éxito
      setTimeout(() => {
        this.downloadProgress = 100;
        this.isInstalling = true;
        this.downloadStarted = true;

        // Mostrar mensaje informativo
        this.downloadError = 'La descarga ha comenzado. Revise su navegador para continuar con la instalación.';

        // Después de unos segundos, cerramos el diálogo
        setTimeout(() => {
          this.activeModal.close(true);
        }, 5000);
      }, 1500);
    } catch (error) {
      console.error('Error al abrir URL de descarga:', error);

      // Limpiar temporizador si existe
      if (this.installationCheckTimeout) {
        clearTimeout(this.installationCheckTimeout);
      }

      this.downloadError = 'Error al iniciar la descarga. Por favor, inténtelo de nuevo.';
      this.isDownloading = false;
      this.isInstalling = false;
      this.downloadStarted = false;
    }
  }

  /**
   * Simula el progreso de descarga para la interfaz de usuario
   */
  private simulateDownloadProgress(): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      if (progress > 95) {
        progress = 95; // Mantenemos en 95% hasta que se complete realmente
        clearInterval(interval);
      }
      this.downloadProgress = progress;
    }, 300);

    // Aseguramos que se limpie el intervalo después de un tiempo razonable
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
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
