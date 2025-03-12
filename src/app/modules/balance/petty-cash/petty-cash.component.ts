import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CreateTransactionDto, PaginatedResult, Transaction, TransactionSummary, TransactionType } from '../models/petty-cash.model';
import { PettyCashService } from '../services/petty-cash.service';
import { ScreenSizeService } from '../services/screen-size.service';
import { CurrencyFormatService } from '../services/currency-format.service';

@Component({
  selector: 'app-petty-cash',
  templateUrl: './petty-cash.component.html',
  styleUrls: ['./petty-cash.component.scss']
})
export class PettyCashComponent implements OnInit, OnDestroy {
  @ViewChild('transactionModal') transactionModal: any;

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

  constructor(
    private pettyCashService: PettyCashService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private screenSizeService: ScreenSizeService,
    private currencyFormatService: CurrencyFormatService
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
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadSummary(): void {
    this.loading = true;
    this.subscriptions.push(
      this.pettyCashService.getSummary().subscribe(
        (summary) => {
          this.transactionSummary = summary;

          // Si el resumen incluye transacciones recientes, las usamos directamente
          if (summary.recentTransactions && summary.recentTransactions.length > 0) {
            this.transactions = summary.recentTransactions;
            this.paginatedResult = {
              items: this.transactions,
              totalCount: this.transactions.length,
              pageIndex: 0,
              pageSize: this.transactions.length
            };
          } else {
            // Si no hay transacciones recientes, cargamos las transacciones normalmente
            this.loadTransactions();
          }

          this.loading = false;
        },
        (error) => {
          console.error('Error al cargar el resumen:', error);
          this.loading = false;
          // Si falla el resumen, intentamos cargar las transacciones de todos modos
          this.loadTransactions();
        }
      )
    );
  }

  loadTransactions(pageIndex: number = this.pageIndex): void {
    this.loading = true;
    this.subscriptions.push(
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
      )
    );
  }

  openNewTransactionModal(): void {
    this.transactionForm.reset({
      amount: 0,
      description: '',
      type: TransactionType.Income
    });
    this.modalService.open(this.transactionModal, { centered: true });
  }

  submitTransaction(): void {
    if (this.transactionForm.invalid) {
      return;
    }

    const transaction: CreateTransactionDto = this.transactionForm.value;

    this.submitting = true;
    this.pettyCashService.createTransaction(transaction).subscribe(
      (result) => {
        this.modalService.dismissAll();
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

  getTransactionTypeText(type: TransactionType): string {
    return type === TransactionType.Income ? 'Ingreso' : 'Egreso';
  }

  getTransactionTypeClass(type: TransactionType): string {
    return type === TransactionType.Income ? 'badge badge-light-success' : 'badge badge-light-danger';
  }

  // Formateador de moneda
  formatCurrency(amount: number): string {
    return this.currencyFormatService.formatCurrency(amount);
  }
}
