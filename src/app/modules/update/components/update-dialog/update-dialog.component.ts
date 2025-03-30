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
  downloadError: string | null = null;
  private progressSubscription: Subscription;

  constructor(
    public activeModal: NgbActiveModal,
    private updateService: UpdateService
  ) { }

  ngOnInit(): void {
    // Suscribirse al progreso de descarga
    this.progressSubscription = this.updateService.downloadProgress$.subscribe(
      progress => {
        this.downloadProgress = progress;
      }
    );
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  /**
   * Iniciar la descarga e instalación del APK
   */
  downloadAndInstall(): void {
    this.isDownloading = true;
    this.downloadError = null;

    this.updateService.downloadAndInstallAPK().subscribe({
      next: (result) => {
        if (result === true) {
          // La descarga e instalación se completó correctamente
          this.activeModal.close(true);
        }
      },
      error: (error) => {
        console.error('Error al descargar o instalar la actualización:', error);
        this.downloadError = 'Error al descargar o instalar la actualización. Por favor, inténtelo de nuevo.';
        this.isDownloading = false;
      }
    });
  }

  /**
   * Cerrar el diálogo si la actualización no es obligatoria
   */
  skipUpdate(): void {
    if (!this.updateInfo.isRequired) {
      this.activeModal.close(false);
    }
  }
}
