import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-log-settings',
  templateUrl: './log-settings.component.html',
  styleUrls: ['./log-settings.component.scss']
})
export class LogSettingsComponent implements OnInit {
  logSettingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.logSettingsForm = this.fb.group({
      enableDetailedLogs: [environment.logging.enableDetailedLogs],
      includePatterns: this.fb.array(
        environment.logging.logPatterns.include.map(pattern => this.fb.control(pattern))
      ),
      excludePatterns: this.fb.array(
        environment.logging.logPatterns.exclude.map(pattern => this.fb.control(pattern))
      )
    });
  }

  get includePatterns(): FormArray {
    return this.logSettingsForm.get('includePatterns') as FormArray;
  }

  get excludePatterns(): FormArray {
    return this.logSettingsForm.get('excludePatterns') as FormArray;
  }

  addIncludePattern(): void {
    this.includePatterns.push(this.fb.control(''));
  }

  addExcludePattern(): void {
    this.excludePatterns.push(this.fb.control(''));
  }

  removeIncludePattern(index: number): void {
    this.includePatterns.removeAt(index);
  }

  removeExcludePattern(index: number): void {
    this.excludePatterns.removeAt(index);
  }

  saveSettings(): void {
    const formValue = this.logSettingsForm.value;

    // Actualizar la configuración en el environment
    environment.logging.enableDetailedLogs = formValue.enableDetailedLogs;
    environment.logging.logPatterns.include = formValue.includePatterns.filter((pattern: any) => pattern.trim() !== '');
    environment.logging.logPatterns.exclude = formValue.excludePatterns.filter((pattern: any) => pattern.trim() !== '');

    // Guardar la configuración en localStorage para persistencia
    localStorage.setItem('logSettings', JSON.stringify({
      enableDetailedLogs: formValue.enableDetailedLogs,
      logPatterns: {
        include: formValue.includePatterns.filter((pattern: any) => pattern.trim() !== ''),
        exclude: formValue.excludePatterns.filter((pattern: any) => pattern.trim() !== '')
      }
    }));

    // Mostrar mensaje de éxito
    alert('Configuración de logs guardada correctamente');
  }

  resetSettings(): void {
    // Restablecer a los valores predeterminados
    environment.logging.enableDetailedLogs = false;
    environment.logging.logPatterns.include = ['Se obtuvieron', 'RESPONSE', 'PERFORMANCE', 'MONGODB'];
    environment.logging.logPatterns.exclude = ['Executed', 'Executing', 'HTTP GET', 'Route matched'];

    // Eliminar la configuración guardada
    localStorage.removeItem('logSettings');

    // Reiniciar el formulario
    this.initForm();

    // Mostrar mensaje
    alert('Configuración de logs restablecida a los valores predeterminados');
  }
}
