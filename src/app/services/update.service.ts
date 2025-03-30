import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, from, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
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
   */
  checkForUpdates(currentVersion: string): Observable<UpdateInfo> {
    return this.http.get<UpdateInfo>(`${this.API_URL}/check-update?currentVersion=${currentVersion}`);
  }

  /**
   * Obtiene la lista de todas las versiones
   */
  getAllVersions(): Observable<any> {
    return this.http.get(`${this.API_URL}/versions`);
  }

  /**
   * Descarga e instala la última versión del APK
   */
  downloadAndInstallAPK(): Observable<any> {
    // Reiniciamos el progreso
    this.downloadProgress.next(0);

    // Solo procedemos si estamos en Android
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      throw new Error('Esta función solo está disponible en dispositivos Android');
    }

    return this.http.get(`${this.API_URL}/lastest-apk`, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.DownloadProgress && event.total) {
          // Calculamos el progreso de la descarga
          const progress = Math.round(100 * event.loaded / event.total);
          this.downloadProgress.next(progress);
        }
      }),
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.Response) {
          // Cuando la descarga se completa, guardamos y abrimos el archivo
          return from(this.saveAndOpenFile(event as HttpResponse<Blob>));
        }
        return null;
      })
    );
  }

  /**
   * Guarda el archivo descargado y lo abre para instalación
   */
  private async saveAndOpenFile(response: HttpResponse<Blob>): Promise<boolean> {
    try {
      const blob = response.body;
      if (!blob) {
        throw new Error('No se recibieron datos del APK');
      }

      // Convertimos el blob a base64
      const base64Data = await this.blobToBase64(blob);

      // Nombre del archivo con timestamp para evitar problemas de caché
      const fileName = `app-update-${Date.now()}.apk`;
      const filePath = `${Directory.External}/${fileName}`;

      // Guardamos el archivo en el almacenamiento
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });

      // Abrimos el archivo para instalación
      await this.fileOpener.open(
        result.uri,
        'application/vnd.android.package-archive'
      );

      // Después de la instalación, eliminamos el archivo
      try {
        await Filesystem.deleteFile({
          path: fileName,
          directory: Directory.External
        });
      } catch (deleteError) {
        console.error('Error al eliminar el archivo APK:', deleteError);
      }

      return true;
    } catch (error) {
      console.error('Error al guardar o abrir el archivo:', error);
      throw error;
    }
  }

  /**
   * Convierte un blob a base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Extraemos solo la parte base64 de la cadena
        const base64Content = base64data.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
