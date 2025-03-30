import { Component, OnInit } from '@angular/core';
import { App } from '../../models/app';
import { AppsStoreService } from '../../services/apps-store.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {
  apps: App[] = [];
  filteredApps: App[] = [];
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  categories: string[] = [];
  selectedCategory = 'Todas';

  private searchTerms = new Subject<string>();

  constructor(private appsService: AppsStoreService) { }

  ngOnInit(): void {
    this.loadApps();

    // Configurar búsqueda con debounce
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        return this.appsService.searchApps(term);
      })
    ).subscribe({
      next: (apps) => {
        this.filterAppsByCategory(apps);
      },
      error: (err) => {
        this.error = 'Error al buscar aplicaciones: ' + err.message;
      }
    });
  }

  /**
   * Cargar todas las aplicaciones
   */
  loadApps(): void {
    this.isLoading = true;
    this.appsService.getApps().subscribe({
      next: (apps) => {
        this.apps = apps;
        this.filteredApps = apps;
        this.extractCategories();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar aplicaciones: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Extraer categorías únicas de las aplicaciones
   */
  extractCategories(): void {
    const uniqueCategories = new Set<string>();
    this.apps.forEach(app => uniqueCategories.add(app.category));
    this.categories = Array.from(uniqueCategories);
  }

  /**
   * Filtrar aplicaciones por categoría
   */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterAppsByCategory(this.apps);
  }

  /**
   * Filtrar aplicaciones por categoría (función interna)
   */
  private filterAppsByCategory(apps: App[]): void {
    if (this.selectedCategory === 'Todas') {
      this.filteredApps = apps;
    } else {
      this.filteredApps = apps.filter(app => app.category === this.selectedCategory);
    }
  }

  /**
   * Manejar la búsqueda
   */
  search(term: string): void {
    this.searchTerms.next(term);
  }

  /**
   * Instalar una aplicación
   */
  installApp(appId: number): void {
    this.appsService.toggleInstallation(appId).subscribe({
      next: (updatedApp) => {
        const index = this.apps.findIndex(app => app.id === updatedApp.id);
        if (index !== -1) {
          this.apps[index] = updatedApp;
        }
      },
      error: (err) => {
        this.error = 'Error al instalar la aplicación: ' + err.message;
      }
    });
  }

  /**
   * Desinstalar una aplicación
   */
  uninstallApp(appId: number): void {
    this.appsService.toggleInstallation(appId).subscribe({
      next: (updatedApp) => {
        const index = this.apps.findIndex(app => app.id === updatedApp.id);
        if (index !== -1) {
          this.apps[index] = updatedApp;
        }
      },
      error: (err) => {
        this.error = 'Error al desinstalar la aplicación: ' + err.message;
      }
    });
  }

  /**
   * Manejar la apertura de una aplicación
   */
  onOpenApp(app: App): void {
    console.log('Abriendo aplicación:', app.name);
    // La navegación se maneja en el componente de tarjeta
  }
}
