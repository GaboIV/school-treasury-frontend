import { Component, OnInit } from '@angular/core';
import { App } from '../../models/app';
import { DownloadStat } from '../../models/download-stat';
import { AppsStoreService } from '../../services/apps-store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-app-detail',
  templateUrl: './app-detail.component.html',
  styleUrls: ['./app-detail.component.scss']
})
export class AppDetailComponent implements OnInit {
  app!: App;
  versionHistory: Partial<App>[] = [];
  isLoading = true;
  error: string | null = null;
  isDirectDownload = false;
  showAllChangelog = false;
  maxChangesDisplay = 3;

  constructor(
    private appsService: AppsStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Verificar si hay un parámetro de descarga directa
    this.route.queryParams.subscribe(params => {
      this.isDirectDownload = params['directDownload'] === 'true';
    });

    this.loadAppDetails();
  }

  /**
   * Cargar detalles de la aplicación y su historial de versiones
   */
  loadAppDetails(): void {
    this.isLoading = true;

    // Cargar la información de la aplicación principal
    this.appsService.getMainApp().subscribe({
      next: (app) => {
        this.app = app;
        this.isLoading = false;

        // Si es descarga directa, iniciar la descarga automáticamente
        if (this.isDirectDownload) {
          this.downloadLatestVersion();
        }

        // Cargar el historial de versiones
        this.loadVersionHistory();
      },
      error: (err) => {
        this.error = 'Error al cargar los detalles de la aplicación: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Cargar historial de versiones
   */
  loadVersionHistory(): void {
    this.appsService.getVersionHistory().subscribe({
      next: (versions) => {
        this.versionHistory = versions;
      },
      error: (err) => {
        console.error('Error al cargar historial de versiones:', err);
      }
    });
  }

  /**
   * Descargar la última versión de la aplicación
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
      error: (err) => {
        console.error('Error al iniciar la descarga:', err);
        this.error = 'Error al iniciar la descarga: ' + (err.message || 'Error desconocido');
      }
    });
  }

  /**
   * Descargar una versión específica del historial
   */
  downloadSpecificVersion(versionId: number): void {
    this.error = null;
    const version = this.versionHistory.find(v => v.id === versionId);

    if (!version || !version.version) {
      this.error = 'Versión no encontrada';
      return;
    }

    this.appsService.downloadVersion(versionId).subscribe({
      next: (url) => {
        // Registrar estadísticas de descarga
        this.registerDownloadStats(versionId.toString(), version.version!);

        // Abrir la URL de descarga
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Error al descargar la versión específica:', err);
        this.error = 'Error al descargar la versión específica: ' + (err.message || 'Error desconocido');
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
      previousVersion: this.app.version, // La versión actual antes de la actualización
      isUpdate: version !== this.app.version, // Es actualización si la versión es diferente
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
   * Regresar a la pantalla anterior
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Mostrar todos los cambios o limitar la vista
   */
  toggleChangelogDisplay(): void {
    this.showAllChangelog = !this.showAllChangelog;
  }

  /**
   * Obtener la lista de cambios limitada si es necesario
   */
  getChangelog(changeLog: string[]): string[] {
    if (this.showAllChangelog) {
      return changeLog;
    }
    return changeLog.slice(0, this.maxChangesDisplay);
  }
}
