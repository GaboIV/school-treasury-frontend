import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { App } from '../../models/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.scss']
})
export class AppCardComponent implements OnInit {
  @Input() app!: App;
  @Output() install = new EventEmitter<number>();
  @Output() uninstall = new EventEmitter<number>();
  @Output() openApp = new EventEmitter<App>();

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  /**
   * Instalar o desinstalar la aplicación
   */
  toggleInstallation(): void {
    if (this.app.isInstalled) {
      this.uninstall.emit(this.app.id);
    } else {
      this.install.emit(this.app.id);
    }
  }

  /**
   * Abrir la aplicación si está instalada
   */
  launchApp(): void {
    if (this.app.isInstalled) {
      this.openApp.emit(this.app);
      if (this.app.appUrl) {
        this.router.navigateByUrl(this.app.appUrl);
      }
    } else {
      this.install.emit(this.app.id);
    }
  }

  /**
   * Devuelve clases CSS basadas en si la app está instalada
   */
  getStatusClass(): string {
    return this.app.isInstalled ? 'app-installed' : '';
  }
}
