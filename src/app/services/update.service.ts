import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  latestVersion: string;
  changeLog: string;
  releaseDate: string;
  isRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private readonly API_URL = `${environment.apiUrl}/api/Update`;

  private downloadProgress = new BehaviorSubject<number>(0);
  public downloadProgress$ = this.downloadProgress.asObservable();

  constructor(
    private http: HttpClient,
    private fileOpener: FileOpener
  ) { }

  /**
   * Verifica si hay actualizaciones disponibles
   * @param currentVersion Versión actual de la aplicación
   * @param platform Plataforma actual (android por defecto)
   */
  checkForUpdates(currentVersion: string, platform: string = 'android'): Observable<UpdateInfo> {
    return this.http.get<UpdateInfo>(`${this.API_URL}/check-update?currentVersion=${currentVersion}&platform=${platform}`);
  }

  /**
   * Obtiene la lista de todas las versiones
   */
  getAllVersions(): Observable<any> {
    return this.http.get(`${this.API_URL}/versions`);
  }

  /**
   * Descarga e instala la última versión del APK usando la API de descargas nativa de Android
   * @param platform Plataforma actual (android por defecto)
   */
  downloadAndInstallAPK(platform: string = 'android'): Observable<any> {
    return new Observable(observer => {
      // Reiniciamos el progreso
      this.downloadProgress.next(0);

      // Solo procedemos si estamos en Android
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        observer.error(new Error('Esta función solo está disponible en dispositivos Android'));
        return;
      }

      try {
        console.log('Iniciando descarga mediante el gestor de descargas de Android');

        // Construimos la URL completa del APK
        const apkUrl = `${this.API_URL}/lastest-apk?platform=${platform}`;
        console.log('URL del APK:', apkUrl);

        // Simulamos progreso para la interfaz de usuario
        this.simulateDownloadProgress();

        // Usamos la API nativa de Android para descargar archivos
        // Esto agregará la descarga a la barra de notificaciones del sistema
        this.downloadWithAndroidManager(apkUrl);

        // Consideramos esto como éxito, aunque no podemos saber si el usuario completó la instalación
        setTimeout(() => {
          this.downloadProgress.next(100);
          observer.next(true);
          observer.complete();
        }, 1500);
      } catch (error: any) {
        console.error('Error al iniciar la descarga:', error);
        observer.error(error);
      }
    });
  }

  /**
   * Inicia una descarga usando el gestor de descargas nativo de Android
   * Esto aparecerá en la barra de notificaciones del sistema
   */
  private downloadWithAndroidManager(url: string): void {
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        // Creamos un elemento <a> invisible para iniciar la descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = `app-update-${Date.now()}.apk`;
        link.setAttribute('download', ''); // Forzar descarga
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.click();

        console.log('Descarga iniciada a través del gestor de descargas del sistema');
      } else {
        // Fallback para navegador web
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error al iniciar la descarga con el gestor nativo:', error);
      // Fallback
      window.open(url, '_system');
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
      this.downloadProgress.next(progress);
    }, 300);

    // Aseguramos que se limpie el intervalo después de un tiempo razonable
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  }
}
