import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseTypeResponse, ExpenseType, ExpenseTypeAll } from '../models/expense-type.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypeService {
  private apiUrl = `${environment.apiUrl}/api/v1/expense-types`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ExpenseTypeAll> {
    return this.http.get<ExpenseTypeAll>(`${this.apiUrl}`);
  }

  getExpenseTypes(page: number = 1, limit: number = 50): Observable<ExpenseTypeResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', limit.toString());

    return this.http.get<ExpenseTypeResponse>(`${this.apiUrl}/paginated`, { params });
  }

  createExpenseType(expenseType: { name: string }): Observable<ExpenseTypeResponse> {
    return this.http.post<ExpenseTypeResponse>(this.apiUrl, expenseType);
  }

  updateExpenseType(expenseType: { id: string, name: string }): Observable<ExpenseTypeResponse> {
    return this.http.put<ExpenseTypeResponse>(`${this.apiUrl}`, expenseType);
  }

  deleteExpenseType(id: string): Observable<ExpenseTypeResponse> {
    return this.http.delete<ExpenseTypeResponse>(`${this.apiUrl}/${id}`);
  }
}
