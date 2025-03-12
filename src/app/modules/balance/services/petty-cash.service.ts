import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateTransactionDto,
  PaginatedResult,
  Transaction,
  TransactionSummary,
  TransactionType
} from '../models/petty-cash.model';
import { environment } from '../../../../environments/environment';

// Interfaces para las respuestas reales de la API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PettyCashService {
  private API_URL = `${environment.apiUrl}/api/v1/petty-cash`;

  constructor(private http: HttpClient) { }

  getPettyCash(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}`).pipe(
      map(response => {
        if (response.success) {
          return {
            ...response.data,
            lastUpdated: new Date(response.data.lastUpdated)
          };
        }
        throw new Error(response.message);
      })
    );
  }

  getSummary(): Observable<TransactionSummary> {
    return this.http.get<ApiResponse<TransactionSummary>>(`${this.API_URL}/summary`).pipe(
      map(response => {
        if (response.success) {
          return {
            ...response.data,
            lastTransactionDate: response.data.lastTransactionDate ? new Date(response.data.lastTransactionDate) : null
          };
        }
        throw new Error(response.message);
      })
    );
  }

  createTransaction(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/transactions`, transaction).pipe(
      map(response => {
        if (response.success) {
          return {
            ...response.data,
            date: new Date(response.data.date)
          };
        }
        throw new Error(response.message);
      })
    );
  }

  getTransactions(pageIndex: number = 0, pageSize: number = 10): Observable<PaginatedResult<Transaction>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResult<Transaction>>>(`${this.API_URL}/transactions`, { params }).pipe(
      map(response => {
        if (response.success) {
          return {
            ...response.data,
            items: response.data.items.map(item => ({
              ...item,
              date: new Date(item.date)
            }))
          };
        }
        throw new Error(response.message);
      })
    );
  }
}
