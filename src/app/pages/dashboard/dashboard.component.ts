import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  dashboardData: DashboardData | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.error = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
      }
    });
  }

  async openModal() {
    return await this.modalComponent.open();
  }

  navigateToCollections() {
    this.router.navigate(['/balance/cobros']);
  }

  navigateToStudents() {
    this.router.navigate(['/accesos/estudiantes']);
  }

  navigateToPettyCash() {
    this.router.navigate(['/balance/caja-chica']);
  }
}
