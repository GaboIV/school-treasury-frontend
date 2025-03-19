import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StudentPaymentResponse } from '../models/student-payment.model';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentPaymentService {
  private apiUrl = `${environment.apiUrl}/api/StudentPayment`;

  constructor(private http: HttpClient) { }

  getPaymentsByCollection(collectionId: string): Observable<StudentPaymentResponse> {
    return this.http.get<StudentPaymentResponse>(`${this.apiUrl}/collection/${collectionId}`);
  }

  registerPayment(payment: {
    id: string;
    amountPaid: number;
    comment?: string;
  }): Observable<StudentPaymentResponse> {
    return this.http.put<StudentPaymentResponse>(`${this.apiUrl}/register-payment`, payment);
  }

  registerPaymentWithImages(formData: FormData): Observable<StudentPaymentResponse> {
    return this.http.put<StudentPaymentResponse>(
      `${this.apiUrl}/register-payment-with-images`,
      formData
    );
  }

  updatePayment(formData: FormData, id: string): Observable<StudentPaymentResponse> {
    return this.http.put<StudentPaymentResponse>(
      `${this.apiUrl}/update-payment-with-images/${id}`,
      formData
    );
  }
}
