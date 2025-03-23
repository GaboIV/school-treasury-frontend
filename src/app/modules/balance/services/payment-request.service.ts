import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export enum PaymentRequestStatus {
  Pending = 'Pending',
  UnderReview = 'UnderReview',
  Approved = 'Approved',
  Rejected = 'Rejected',
  NeedsChanges = 'NeedsChanges'
}

export interface PaymentRequestDto {
  id: string;
  studentId: string;
  studentName: string;
  amountPaid: number;
  paymentDate: Date;
  comment: string;
  status: PaymentRequestStatus;
  images: Array<{ id: string, url: string }>;
  adminComments: Array<{ id: string, adminId: string, adminName: string, text: string, date: Date }>;
}

export interface CreatePaymentRequestDto {
  studentId: string;
  amountPaid: number;
  paymentDate: Date;
  comment: string;
}

export interface UpdatePaymentRequestDto {
  amountPaid: number;
  paymentDate: Date;
  comment: string;
}

export interface ApprovePaymentRequestDto {
  comment?: string;
}

export interface RejectPaymentRequestDto {
  reason: string;
}

export interface RequestChangesDto {
  reason: string;
}

export interface AddAdminCommentDto {
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentRequestService {
  private baseUrl = `${environment.apiUrl}/api/v1/PaymentRequest`;

  constructor(private http: HttpClient) { }

  // Obtener todas las solicitudes
  getAll(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  // Obtener solicitudes por estudiante
  getByStudent(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/student/${studentId}`);
  }

  // Obtener historial de solicitudes por estudiante
  getHistoryByStudent(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/student/${studentId}/history`);
  }

  // Obtener solicitudes por estado
  getByStatus(status: PaymentRequestStatus): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/status/${status}`);
  }

  // Obtener solicitudes pendientes
  getPending(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pending`);
  }

  // Obtener solicitudes en revisión
  getUnderReview(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/under-review`);
  }

  // Obtener solicitudes que necesitan cambios
  getNeedsChanges(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/needs-changes`);
  }

  // Obtener una solicitud por ID
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Crear una solicitud
  create(request: CreatePaymentRequestDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, request);
  }

  // Crear una solicitud con imágenes
  createWithImages(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/with-images`, formData);
  }

  // Actualizar una solicitud
  update(id: string, request: UpdatePaymentRequestDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, request);
  }

  // Actualizar una solicitud con imágenes
  updateWithImages(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/with-images/${id}`, formData);
  }

  // Eliminar una solicitud
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  // Aprobar una solicitud
  approve(id: string, dto: ApprovePaymentRequestDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/approve`, dto);
  }

  // Rechazar una solicitud
  reject(id: string, dto: RejectPaymentRequestDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/reject`, dto);
  }

  // Solicitar cambios en una solicitud
  requestChanges(id: string, dto: RequestChangesDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/request-changes`, dto);
  }

  // Añadir un comentario administrativo
  addComment(id: string, dto: AddAdminCommentDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/comment`, dto);
  }
}
