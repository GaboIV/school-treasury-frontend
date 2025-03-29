import { Component, OnDestroy, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CreateTransactionDto, PaginatedResult, Transaction, TransactionSummary, TransactionType } from '../models/petty-cash.model';
import { PettyCashService } from '../services/petty-cash.service';
import { ScreenSizeService } from '../services/screen-size.service';
import { CurrencyFormatService } from '../services/currency-format.service';
import { LocationStrategy } from '@angular/common';
import { UserRole } from '../../auth/services/role.service';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-petty-cash',
  templateUrl: './petty-cash.component.html',
  styleUrls: ['./petty-cash.component.scss']
})
export class PettyCashComponent implements OnInit, OnDestroy {
  @ViewChild('transactionModal') transactionModal: any;
  @ViewChild('transactionsContainer') transactionsContainer: ElementRef;

  // Exponemos Math para usarlo en la plantilla
  Math = Math;

  currentUser: any;
  isAdmin: boolean = false;
  isRepresentative: boolean = false;
  transactionSummary: TransactionSummary | null = null;
  transactions: Transaction[] = [];
  paginatedResult: PaginatedResult<Transaction> | null = null;

  transactionForm: FormGroup;
  loading = false;
  submitting = false;
  pageIndex = 0;
  pageSize = 10;

  // Enums para usar en la plantilla
  TransactionType = TransactionType;

  // Suscripciones
  private subscriptions: Subscription[] = [];

  // Para responsive design
  isSmallScreen = false;

  // Para manejar el modal
  private activeModalRef: NgbModalRef | null = null;
  private modalOpen = false;

  // Para el control de gestos
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  minSwipeDistance: number = 50; // Distancia mínima para considerar swipe - pública para depuración

  // Valores de depuración para swipe
  debugSwipe: boolean = false; // Desactivado por defecto, activar solo para depuración
  swipeDistance: number = 0;
  swipeStartX: number = 0;
  swipeEndX: number = 0;

  // Para el toast de notificación de cambio de página
  showPageChangeToast: boolean = false;
  pageChangeMessage: string = '';
  pageChangeToastTimeout: any = null;

  // Para animación de transición entre páginas
  isPageChanging: boolean = false;

  constructor(
    private pettyCashService: PettyCashService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService,
    private currencyFormatService: CurrencyFormatService,
    private locationStrategy: LocationStrategy,
    private authService: AuthService
  ) {
    this.transactionForm = this.formBuilder.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      type: [TransactionType.Income, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSummary();

    this.subscriptions.push(
      this.screenSizeService.isMobile$.subscribe((isMobile: boolean) => {
        this.isSmallScreen = isMobile;
      })
    );

    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser) {
      this.isAdmin = this.currentUser.roles.includes(UserRole.Administrator);
      this.isRepresentative = this.currentUser.roles.includes(UserRole.Representative);
    }
  }

  ngAfterViewInit(): void {
    console.log('View init - contenedor transacciones:', this.transactionsContainer?.nativeElement);
  }

  // Configurar detección de gestos para swipe
  setupSwipeGestures(): void {
    // No necesario ahora ya que usamos los eventos directamente en el HTML
    console.log('Swipe gestures configurados por HTML');
  }

  // Manejar inicio de toque
  handleTouchStart(e: TouchEvent): void {
    console.log('Touch start event:', e);
    this.touchStartX = e.touches[0].screenX;
    this.swipeStartX = this.touchStartX; // Para depuración
    console.log('Touch start:', this.touchStartX);
  }

  // Manejar fin de toque y determinar si fue swipe
  handleTouchEnd(e: TouchEvent): void {
    console.log('Touch end event:', e);
    this.touchEndX = e.changedTouches[0].screenX;
    this.swipeEndX = this.touchEndX; // Para depuración
    console.log('Touch end:', this.touchEndX);
    this.checkSwipeDirection();
  }

  // Verificar dirección del swipe y cambiar página si es necesario
  checkSwipeDirection(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;
    this.swipeDistance = swipeDistance; // Para depuración

    console.log('Swipe distance:', swipeDistance);

    // Si el gesto fue muy corto, ignorarlo
    if (Math.abs(swipeDistance) < this.minSwipeDistance) {
      console.log('Swipe ignorado - distancia insuficiente');
      return;
    }

    if (swipeDistance > 0) {
      // Swipe a la derecha - página anterior
      console.log('Swipe derecha detectado');
      if (this.pageIndex > 0) {
        this.pageChanged('prev');
        this.showPageChangeNotification('anterior');
      }
    } else {
      // Swipe a la izquierda - página siguiente
      console.log('Swipe izquierda detectado');
      if (this.paginatedResult && this.pageIndex < Math.ceil(this.paginatedResult.totalCount / this.pageSize) - 1) {
        this.pageChanged('next');
        this.showPageChangeNotification('siguiente');
      }
    }
  }

  // Mostrar notificación de cambio de página
  showPageChangeNotification(direction: string): void {
    // Limpiar timeout anterior si existe
    if (this.pageChangeToastTimeout) {
      clearTimeout(this.pageChangeToastTimeout);
    }

    // Mostrar notificación
    this.pageChangeMessage = `Página ${direction}: ${this.pageIndex + 1}`;
    this.showPageChangeToast = true;

    // Ocultar después de 2 segundos
    this.pageChangeToastTimeout = setTimeout(() => {
      this.showPageChangeToast = false;
    }, 2000);
  }

  // Manejar el evento de navegación hacia atrás
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // Si el modal está abierto, cerrarlo
    if (this.modalOpen && this.activeModalRef) {
      this.activeModalRef.dismiss('back');
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Limpiar timeout si existe
    if (this.pageChangeToastTimeout) {
      clearTimeout(this.pageChangeToastTimeout);
    }

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadSummary(): void {
    this.loading = true;
    this.pettyCashService.getSummary().subscribe(
      (summary: TransactionSummary) => {
        this.transactionSummary = summary;
        this.loadTransactions(this.pageIndex);
      },
      (error: any) => {
        console.error('Error al cargar el resumen:', error);
        this.loading = false;
      }
    );
  }

  loadTransactions(pageIndex: number): void {
    this.loading = true;
    this.isPageChanging = true; // Iniciar animación

    this.pettyCashService.getTransactions(pageIndex, this.pageSize).subscribe(
      (result) => {
        // Aplicar una breve transición antes de mostrar los nuevos datos
        setTimeout(() => {
          this.paginatedResult = result;
          this.transactions = result.items;
          this.loading = false;

          // Finalizar la animación después de un breve retraso
          setTimeout(() => {
            this.isPageChanging = false;
          }, 150);
        }, 100);
      },
      (error) => {
        console.error('Error al cargar las transacciones:', error);
        this.loading = false;
        this.isPageChanging = false;
      }
    );
  }

  getTransactionTypeText(type: TransactionType): string {
    return type === TransactionType.Income ? 'Ingreso' : 'Egreso';
  }

  openNewTransactionModal(): void {
    this.transactionForm.reset({
      amount: 0,
      description: '',
      type: TransactionType.Income
    });

    // Guardar referencia al modal y marcar como abierto
    this.activeModalRef = this.modalService.open(this.transactionModal, { centered: true });
    this.modalOpen = true;

    // Agregar una entrada al historial para manejar el botón de retroceso
    this.locationStrategy.pushState(
      { modal: 'transaction-modal' },
      '',
      window.location.pathname,
      ''
    );

    // Cuando el modal se cierre, actualizar el estado
    this.activeModalRef.result.finally(() => {
      this.modalOpen = false;
      this.activeModalRef = null;
    });
  }

  submitTransaction(): void {
    if (this.transactionForm.invalid) {
      return;
    }

    const transaction: CreateTransactionDto = this.transactionForm.value;

    this.submitting = true;
    this.pettyCashService.createTransaction(transaction).subscribe(
      (result) => {
        if (this.activeModalRef) {
          this.activeModalRef.dismiss();
        }
        this.loadSummary(); // Recargamos el resumen y las transacciones
        this.submitting = false;
      },
      (error) => {
        console.error('Error al crear la transacción:', error);
        this.submitting = false;
      }
    );
  }

  pageChanged(event: any): void {
    // Si el evento es un número, lo consideramos como el número de página
    let newPageIndex = typeof event === 'number' ? event - 1 : this.pageIndex;

    // Si es el botón anterior
    if (event === 'prev') {
      newPageIndex = Math.max(0, this.pageIndex - 1);
    }
    // Si es el botón siguiente
    else if (event === 'next') {
      newPageIndex = this.pageIndex + 1;
    }
    // Si es el botón primera página
    else if (event === 'first') {
      newPageIndex = 0;
    }
    // Si es el botón última página y tenemos datos de paginación
    else if (event === 'last' && this.paginatedResult) {
      newPageIndex = Math.ceil(this.paginatedResult.totalCount / this.pageSize) - 1;
    }

    // Solo cargamos si hay cambio de página
    if (newPageIndex !== this.pageIndex) {
      this.pageIndex = newPageIndex;
      this.loadTransactions(this.pageIndex);
    }
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === TransactionType.Income ? 'badge badge-light-success' : 'badge badge-light-danger';
  }

  /**
   * Genera un array con los números de página a mostrar en la paginación
   * considerando la página actual y el total de páginas
   */
  getPageNumbers(): number[] {
    if (!this.paginatedResult) {
      return [];
    }

    const totalPages = Math.ceil(this.paginatedResult.totalCount / this.pageSize);
    const currentPage = this.pageIndex + 1;
    const maxPagesToShow = 5;
    const pages: number[] = [];

    // Para menos de 6 páginas, mostrar todas
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Calcular rango a mostrar considerando la página actual y dejándola en el centro
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    // Ajustar si el rango se pasa del final
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Generar array con los números de página
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Formateador de moneda
  formatCurrency(amount: number): string {
    return this.currencyFormatService.formatCurrency(amount);
  }
}
