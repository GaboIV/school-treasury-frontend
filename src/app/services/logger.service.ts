import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private config = environment.logging;

  constructor() {
    // Cargar configuración desde localStorage si existe
    this.loadConfigFromLocalStorage();

    // Sobrescribir console.log para filtrar mensajes
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    const self = this;

    console.log = function(...args) {
      if (self.shouldLog(args[0])) {
        originalConsoleLog.apply(console, args);
      }
    };

    console.error = function(...args) {
      if (self.shouldLog(args[0])) {
        originalConsoleError.apply(console, args);
      }
    };

    console.warn = function(...args) {
      if (self.shouldLog(args[0])) {
        originalConsoleWarn.apply(console, args);
      }
    };

    console.info = function(...args) {
      if (self.shouldLog(args[0])) {
        originalConsoleInfo.apply(console, args);
      }
    };
  }

  /**
   * Carga la configuración de logs desde localStorage
   */
  private loadConfigFromLocalStorage(): void {
    const savedConfig = localStorage.getItem('logSettings');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        environment.logging.enableDetailedLogs = parsedConfig.enableDetailedLogs;
        environment.logging.logPatterns.include = parsedConfig.logPatterns.include;
        environment.logging.logPatterns.exclude = parsedConfig.logPatterns.exclude;
        this.config = environment.logging;
      } catch (error) {
        console.error('Error al cargar la configuración de logs:', error);
      }
    }
  }

  /**
   * Determina si un mensaje debe ser mostrado en la consola
   * @param message El mensaje a evaluar
   * @returns true si el mensaje debe mostrarse, false en caso contrario
   */
  private shouldLog(message: any): boolean {
    // Si los logs detallados están habilitados, mostrar todo
    if (this.config.enableDetailedLogs) {
      return true;
    }

    // Si el mensaje no es un string, mostrarlo
    if (typeof message !== 'string') {
      return true;
    }

    // Verificar si el mensaje contiene alguno de los patrones a incluir
    const shouldInclude = this.config.logPatterns.include.some(pattern =>
      message.includes(pattern)
    );

    if (shouldInclude) {
      return true;
    }

    // Verificar si el mensaje contiene alguno de los patrones a excluir
    const shouldExclude = this.config.logPatterns.exclude.some(pattern =>
      message.includes(pattern)
    );

    // Si el mensaje contiene un patrón a excluir, no mostrarlo
    if (shouldExclude) {
      return false;
    }

    // Por defecto, mostrar el mensaje
    return true;
  }

  /**
   * Registra un mensaje en la consola
   * @param message El mensaje a registrar
   * @param args Argumentos adicionales
   */
  log(message: any, ...args: any[]): void {
    if (this.shouldLog(message)) {
      console.log(message, ...args);
    }
  }

  /**
   * Registra un error en la consola
   * @param message El mensaje de error
   * @param args Argumentos adicionales
   */
  error(message: any, ...args: any[]): void {
    if (this.shouldLog(message)) {
      console.error(message, ...args);
    }
  }

  /**
   * Registra una advertencia en la consola
   * @param message El mensaje de advertencia
   * @param args Argumentos adicionales
   */
  warn(message: any, ...args: any[]): void {
    if (this.shouldLog(message)) {
      console.warn(message, ...args);
    }
  }

  /**
   * Registra información en la consola
   * @param message El mensaje informativo
   * @param args Argumentos adicionales
   */
  info(message: any, ...args: any[]): void {
    if (this.shouldLog(message)) {
      console.info(message, ...args);
    }
  }

  /**
   * Actualiza la configuración de logs
   * @param config La nueva configuración
   */
  updateConfig(config: any): void {
    environment.logging = config;
    this.config = environment.logging;
  }
}
