import { Component, OnInit } from '@angular/core';
import { App } from '../../models/app';
import { DownloadStat } from '../../models/download-stat';
import { AppsStoreService } from '../../services/apps-store.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {
  app!: App;
  isLoading = true;
  error: string | null = null;

  constructor(
    private appsService: AppsStoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMainApp();
  }

  /**
   * Cargar la aplicación principal
   */
  loadMainApp(): void {
    this.isLoading = true;
    this.error = null;

    this.appsService.getMainApp().subscribe({
      next: (app) => {
        this.app = app;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar la aplicación:', err);
        this.error = 'Error al cargar la aplicación: ' + (err.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }

  /**
   * Descargar la última versión
   */
  downloadLatestVersion(): void {
    this.error = null;

    this.appsService.downloadLatestVersion().subscribe({
      next: (url) => {
        // Registrar estadísticas de descarga
        this.registerDownloadStats(this.app.id.toString(), this.app.version);

        // Abrir la URL de descarga
        window.open(url, '_blank');
      },
      error: (err: any) => {
        console.error('Error al iniciar la descarga:', err);
        this.error = 'Error al iniciar la descarga: ' + (err.message || 'Error desconocido');
      }
    });
  }

  /**
   * Registrar estadísticas de descarga
   */
  private registerDownloadStats(versionId: string, version: string): void {
    // Crear objeto de estadísticas
    const downloadStat: DownloadStat = {
      deviceModel: navigator.platform || 'Unknown',
      deviceOs: this.getDeviceOs(),
      deviceOsVersion: navigator.userAgent || 'Unknown',
      previousVersion: version, // En este caso es la misma versión
      isUpdate: false,
      status: 'Success',
      downloadDate: new Date()
    };

    // Registrar estadísticas
    this.appsService.registerDownloadStats(versionId, version, downloadStat).subscribe({
      error: (err) => console.error('Error al registrar estadísticas:', err)
    });
  }

  /**
   * Obtener sistema operativo del dispositivo
   */
  private getDeviceOs(): string {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'iOS';
    }

    if (/windows/i.test(userAgent)) {
      return 'Windows';
    }

    if (/mac/i.test(userAgent)) {
      return 'MacOS';
    }

    return 'Unknown';
  }

  /**
   * Navegar al detalle de la aplicación
   */
  goToAppDetail(): void {
    this.router.navigate(['/apps/details']);
  }

  /**
   * Comprobar si hay actualizaciones disponibles
   */
  checkForUpdates(): void {
    if (!this.app || !this.app.version) {
      return;
    }

    this.error = null;

    this.appsService.checkForUpdates(this.app.version).subscribe({
      next: (result) => {
        if (result.hasUpdate) {
          // Si hay una actualización disponible, mostrar mensaje y opción de descarga
          this.error = null;
          alert(`Hay una nueva versión disponible: ${result.latestVersion}. ¿Desea descargarla?`);
          // Aquí podrías mostrar un modal o un mensaje más elegante
        } else {
          // Si no hay actualizaciones, mostrar mensaje
          alert('Su aplicación está actualizada.');
        }
      },
      error: (err) => {
        console.error('Error al comprobar actualizaciones:', err);
        this.error = 'Error al comprobar actualizaciones: ' + (err.message || 'Error desconocido');
      }
    });
  }
}
