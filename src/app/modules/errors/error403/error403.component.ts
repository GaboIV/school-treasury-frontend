import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-error403',
  templateUrl: './error403.component.html',
})
export class Error403Component implements OnInit, OnDestroy {
  private logoutTimer: any;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Se configura el logout automático después de 3 segundos
    this.logoutTimer = setTimeout(() => {
      this.authService.logout();
    }, 3000);
  }

  // Si el usuario hace clic en "Return Home", se cancela el temporizador y se realiza el logout inmediatamente
  backToHome() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.authService.logout();
  }

  // Limpiar el temporizador en caso de que el componente se destruya antes de que se ejecute el logout
  ngOnDestroy(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }
}
