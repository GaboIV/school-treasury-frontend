import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExpenseResponse } from '../models/expense.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/api/v1/expenses`;

  constructor(private http: HttpClient) { }

  getExpenses(page: number = 1, limit: number = 50): Observable<ExpenseResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', limit.toString());

    return this.http.get<ExpenseResponse>(`${this.apiUrl}/paginated`, { params });
  }

  createExpense(expense: { name: string }): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(this.apiUrl, expense);
  }

  updateExpense(expense: { id: string, name: string }): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse>(`${this.apiUrl}`, expense);
  }

  deleteExpense(id: string): Observable<ExpenseResponse> {
    return this.http.delete<ExpenseResponse>(`${this.apiUrl}/${id}`);
  }

  updateExpenseAdjustedAmount(expense: { id: string, adjustedAmount: number, surplus: number }): Observable<ApiResponse<any>> {
    console.log(`ID: ${expense.id}, Monto Ajustado: ${expense.adjustedAmount}, Excedente: ${expense.surplus}`);
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${expense.id}/adjust-amount`, expense);
  }
}
