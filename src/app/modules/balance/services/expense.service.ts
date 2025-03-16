import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExpenseResponse } from '../models/expense.model';

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

  createExpense(expense: any): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(this.apiUrl, expense);
  }

  updateExpense(expense: any): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse>(`${this.apiUrl}`, expense);
  }

  deleteExpense(id: string): Observable<ExpenseResponse> {
    return this.http.delete<ExpenseResponse>(`${this.apiUrl}/${id}`);
  }
}