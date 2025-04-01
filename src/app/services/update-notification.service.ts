import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppsStoreService } from '../modules/apps-store/services/apps-store.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateNotificationService {
  private currentVersion = '2.2.0'; // Versión actual simulada de la app

  constructor(
    private router: Router,
    private appsStoreService: AppsStoreService
  ) { }

  /**
   * Verifica si hay actualizaciones disponibles
   */
  checkForUpdates(): Observable<{hasUpdate: boolean, latestVersion: string, apkUrl: string}> {
    return this.appsStoreService.checkForUpdates(this.currentVersion);
  }

  /**
   * Muestra un modal de actualización si hay versiones nuevas disponibles
   * @param useBootstrapModal Si es true, usa un modal de Bootstrap. Si es false, usa un diálogo nativo.
   */
  showUpdateNotification(useBootstrapModal = true): void {
    this.checkForUpdates().subscribe({
      next: (result) => {
        if (result.hasUpdate) {
          if (useBootstrapModal) {
            this.showBootstrapModal(result.latestVersion);
          } else {
            this.showNativeConfirm(result.latestVersion);
          }
        }
      },
      error: (err) => {
        console.error('Error al verificar actualizaciones:', err);
      }
    });
  }

  /**
   * Muestra un modal de Bootstrap para notificar sobre la nueva versión
   */
  private showBootstrapModal(latestVersion: string): void {
    // Esta implementación supone que tienes una estructura modal de Bootstrap en tu aplicación
    // y un servicio para manejarlo. Aquí se simula el comportamiento.

    // En un entorno real, podrías usar NgbModal o similar
    console.log(`Modal de Bootstrap: Nueva versión ${latestVersion} disponible`);

    // Simular acción del usuario después de un pequeño retraso
    setTimeout(() => {
      if (confirm(`¿Deseas actualizar a la versión ${latestVersion}?`)) {
        this.navigateToAppDownload(false);
      }
    }, 500);
  }

  /**
   * Muestra un diálogo nativo para notificar sobre la nueva versión
   */
  private showNativeConfirm(latestVersion: string): void {
    if (confirm(`¡Nueva versión disponible! (${latestVersion})\n\n¿Deseas actualizar ahora?`)) {
      this.navigateToAppDownload(false);
    }
  }

  /**
   * Navega a la página de descarga de la aplicación
   * @param directDownload Si es true, inicia la descarga automáticamente
   */
  navigateToAppDownload(directDownload = false): void {
    const queryParams = directDownload ? { directDownload: 'true' } : {};
    this.router.navigate(['/apps'], { queryParams });
  }
}
