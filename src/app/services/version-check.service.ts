import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateService, UpdateInfo } from './update.service';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionCheckService {
  private readonly currentVersion: string = environment.appVersion.replace('v', '');
  private lastChecked: Date | null = null;

  constructor(
    private updateService: UpdateService,
    private modalService: NgbModal
  ) {}

  /**
   * Verifica si hay actualizaciones disponibles
   * @param showDialog Si es true, muestra el diálogo de actualización si hay una nueva versión
   * @param forceCheck Si es true, fuerza la verificación incluso si se ha verificado recientemente
   * @returns Promesa que se resuelve con true si hay una actualización
   */
  async checkForUpdates(showDialog = true, forceCheck = false): Promise<boolean> {
    console.log("Version actual: ", this.currentVersion);
    // Solo verificamos en dispositivos Android
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return false;
    }

    // Para evitar verificaciones excesivas, solo verificamos cada 30 minutos
    const currentTime = new Date();
    if (!forceCheck && this.lastChecked &&
        (currentTime.getTime() - this.lastChecked.getTime() < 30 * 60 * 1000)) {
      return false;
    }

    this.lastChecked = currentTime;

    try {
      // Obtenemos la plataforma actual
      const platform = Capacitor.getPlatform();
      console.log("Plataforma actual: ", platform);

      // Enviamos la versión actual y la plataforma
      const updateInfo = await firstValueFrom(
        this.updateService.checkForUpdates(this.currentVersion, platform)
      );

      if (updateInfo && updateInfo.isUpdateAvailable) {
        if (showDialog) {
          await this.showUpdateDialog(updateInfo);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
      return false;
    }
  }

  /**
   * Muestra el diálogo de actualización
   * @param updateInfo Información de la actualización
   */
  private async showUpdateDialog(updateInfo: UpdateInfo): Promise<void> {
    // Necesitamos importar el componente de diálogo de manera dinámica para evitar
    // problemas con la inicialización de módulos
    const { UpdateDialogComponent } = await import('../modules/update/components/update-dialog/update-dialog.component');

    const modalRef = this.modalService.open(UpdateDialogComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: !updateInfo.isRequired,
      centered: true
    });

    modalRef.componentInstance.updateInfo = updateInfo;

    try {
      const result = await modalRef.result;
      // Podemos hacer algo con el resultado si es necesario
    } catch (dismissReason) {
      // El usuario cerró el diálogo (solo si no es obligatorio)
      console.log('Actualización pospuesta');
    }
  }
}
