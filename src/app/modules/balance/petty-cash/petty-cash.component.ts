import { Component, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
    this.pettyCashService.getTransactions(pageIndex, this.pageSize).subscribe(
      (result) => {
        this.paginatedResult = result;
        this.transactions = result.items;
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar las transacciones:', error);
        this.loading = false;
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
    this.pageIndex = event - 1;
    this.loadTransactions(this.pageIndex);
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === TransactionType.Income ? 'badge badge-light-success' : 'badge badge-light-danger';
  }

  // Formateador de moneda
  formatCurrency(amount: number): string {
    return this.currencyFormatService.formatCurrency(amount);
  }
}
