import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { App } from '../models/app';
import { DownloadStat } from '../models/download-stat';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppsStoreService {
  // URL base para la API
  private apiUrl = `${environment.apiUrl}/api/apps`;

  // Datos de la aplicación principal
  private mainApp: App = {
    id: 1,
    name: 'Sistema de Tesorería Escolar',
    description: 'Aplicación oficial para la gestión de tesorería en instituciones educativas. Permite administrar ingresos, gastos, reportes y comunicados a padres.',
    imageUrl: 'assets/media/apps/treasury.svg',
    appUrl: '/',
    category: 'Finanzas',
    rating: 4.8,
    downloads: 1560,
    isInstalled: true,
    version: '2.3.0',
    apkUrl: 'https://example.com/treasuryapp-2.3.0.apk',
    releaseDate: '2023-10-15',
    changeLog: [
      'Mejoras en el rendimiento general de la aplicación',
      'Corrección de errores en el módulo de reportes',
      'Nueva funcionalidad para exportar datos a Excel',
      'Interfaz renovada con mejor experiencia de usuario',
      'Soporte para dispositivos con pantallas plegables'
    ],
    minAndroidVersion: '6.0',
    size: '25.4'
  };

  // Historial de versiones
  private versionHistory: Partial<App>[] = [
    {
      id: 101,
      version: '2.2.0',
      releaseDate: '2023-08-20',
      apkUrl: 'https://example.com/treasuryapp-2.2.0.apk',
      changeLog: [
        'Nuevo módulo de presupuestos',
        'Corrección de errores menores',
        'Mejoras en la seguridad'
      ],
      size: '24.8'
    },
    {
      id: 102,
      version: '2.1.5',
      releaseDate: '2023-07-05',
      apkUrl: 'https://example.com/treasuryapp-2.1.5.apk',
      changeLog: [
        'Corrección de error crítico en sincronización',
        'Mejoras en el rendimiento'
      ],
      size: '24.1'
    },
    {
      id: 103,
      version: '2.1.0',
      releaseDate: '2023-06-10',
      apkUrl: 'https://example.com/treasuryapp-2.1.0.apk',
      changeLog: [
        'Integración con servicios de pagos',
        'Nueva interfaz para el módulo de cobros',
        'Mejoras en accesibilidad'
      ],
      size: '23.5'
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la información de la aplicación principal
   */
  getMainApp(): Observable<App> {
    return this.http.get<App>(`${this.apiUrl}/main`);
  }

  /**
   * Obtiene el historial de versiones de la aplicación
   */
  getVersionHistory(): Observable<Partial<App>[]> {
    return this.http.get<Partial<App>[]>(`${this.apiUrl}/versions`);
  }

  /**
   * Descarga directa de la última versión
   */
  downloadLatestVersion(): Observable<string> {
    // Crear los parámetros para el dispositivo actual
    const params = this.getDeviceParams();

    return this.http.get<string>(`${this.apiUrl}/download/latest`, { params });
  }

  /**
   * Descargar una versión específica
   */
  downloadVersion(versionId: number): Observable<string> {
    // Crear los parámetros para el dispositivo actual
    const params = this.getDeviceParams();

    return this.http.get<string>(`${this.apiUrl}/download/${versionId}`, { params });
  }

  /**
   * Verifica si hay una actualización disponible
   * @param currentVersion La versión actual de la aplicación
   */
  checkForUpdates(currentVersion: string): Observable<{hasUpdate: boolean, latestVersion: string, apkUrl: string}> {
    const params = new HttpParams().set('currentVersion', currentVersion);

    return this.http.get<{hasUpdate: boolean, latestVersion: string, apkUrl: string}>(`${this.apiUrl}/check-update`, { params });
  }

  /**
   * Registra estadísticas de descarga
   * @param versionId ID de la versión
   * @param version Número de versión
   * @param statsData Datos de estadísticas
   */
  registerDownloadStats(versionId: string, version: string, statsData: DownloadStat): Observable<any> {
    const params = new HttpParams()
      .set('versionId', versionId)
      .set('version', version);

    return this.http.post(`${this.apiUrl}/download/stats`, statsData, { params });
  }

  /**
   * Obtiene estadísticas de descarga
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param version Versión específica (opcional)
   */
  getStats(startDate?: Date, endDate?: Date, version?: string): Observable<DownloadStat[]> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }

    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    if (version) {
      params = params.set('version', version);
    }

    return this.http.get<DownloadStat[]>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Obtiene los parámetros de dispositivo para las descargas
   */
  private getDeviceParams(): HttpParams {
    // Aquí se podrían detectar los datos reales del dispositivo
    // Por ahora usamos valores predeterminados
    return new HttpParams()
      .set('DeviceModel', navigator.platform || 'Unknown')
      .set('DeviceOs', this.getDeviceOs())
      .set('DeviceOsVersion', navigator.userAgent || 'Unknown')
      .set('PreviousVersion', this.mainApp.version || '1.0.0')
      .set('IsUpdate', 'true');
  }

  /**
   * Detecta el sistema operativo del dispositivo
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
}
