import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { App } from '../models/app';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppsStoreService {
  // URL base para la API
  private apiUrl = `${environment.apiUrl}/apps`;

  // Lista de aplicaciones de ejemplo para desarrollo
  private mockApps: App[] = [
    {
      id: 1,
      name: 'Sistema de Tesorería',
      description: 'Aplicación principal para gestión de tesorería escolar',
      imageUrl: 'assets/media/apps/treasury.svg',
      appUrl: '/',
      category: 'Finanzas',
      rating: 4.5,
      downloads: 1200,
      isInstalled: true
    },
    {
      id: 2,
      name: 'Control de Asistencia',
      description: 'Registra la asistencia de estudiantes y genera reportes',
      imageUrl: 'assets/media/apps/attendance.svg',
      appUrl: '/attendance',
      category: 'Académico',
      rating: 4.2,
      downloads: 980,
      isInstalled: false
    },
    {
      id: 3,
      name: 'Calendario Escolar',
      description: 'Administra eventos, exámenes y actividades del calendario escolar',
      imageUrl: 'assets/media/apps/calendar.svg',
      appUrl: '/calendar',
      category: 'Planificación',
      rating: 4.7,
      downloads: 1450,
      isInstalled: true
    },
    {
      id: 4,
      name: 'Comunicados',
      description: 'Sistema de comunicación entre profesores, padres y administración',
      imageUrl: 'assets/media/apps/communication.svg',
      appUrl: '/communications',
      category: 'Comunicación',
      rating: 4.0,
      downloads: 890,
      isInstalled: false
    },
    {
      id: 5,
      name: 'Biblioteca Digital',
      description: 'Acceso a recursos educativos digitales',
      imageUrl: 'assets/media/apps/library.svg',
      appUrl: '/library',
      category: 'Académico',
      rating: 4.3,
      downloads: 760,
      isInstalled: false
    },
    {
      id: 6,
      name: 'Reportes Académicos',
      description: 'Generación de informes y estadísticas de rendimiento',
      imageUrl: 'assets/media/apps/reports.svg',
      appUrl: '/reports',
      category: 'Académico',
      rating: 4.6,
      downloads: 1100,
      isInstalled: true
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las aplicaciones disponibles
   */
  getApps(): Observable<App[]> {
    // En producción, descomentar la siguiente línea
    // return this.http.get<App[]>(this.apiUrl);

    // Datos de prueba para desarrollo
    return of(this.mockApps);
  }

  /**
   * Obtiene aplicaciones por categoría
   */
  getAppsByCategory(category: string): Observable<App[]> {
    // Usar datos de prueba para desarrollo
    const filteredApps = this.mockApps.filter(app => app.category === category);
    return of(filteredApps);
  }

  /**
   * Buscar aplicaciones por nombre o descripción
   */
  searchApps(term: string): Observable<App[]> {
    const searchTerm = term.toLowerCase();
    const filteredApps = this.mockApps.filter(app =>
      app.name.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm)
    );
    return of(filteredApps);
  }

  /**
   * Instalar o desinstalar una aplicación
   */
  toggleInstallation(appId: number): Observable<App> {
    // En un entorno real, esto se haría con una llamada PUT/POST a la API
    const appIndex = this.mockApps.findIndex(app => app.id === appId);
    if (appIndex !== -1) {
      this.mockApps[appIndex].isInstalled = !this.mockApps[appIndex].isInstalled;
      return of(this.mockApps[appIndex]);
    }

    // Si no se encuentra la app
    throw new Error('Aplicación no encontrada');
  }
}
