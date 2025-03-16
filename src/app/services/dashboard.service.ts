import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PendingPayment {
  id: string;
  studentId: string;
  studentName: string;
  collectionName: string;
  pendingAmount: number;
  paymentStatus: number;
}

export interface PendingPaymentsData {
  totalPendingPayments: number;
  totalPayments: number;
  completionPercentage: number;
  totalPendingAmount: number;
  topPendingPayments: PendingPayment[];
  remainingPendingPayments: number;
}

export interface StudentInitial {
  id: string;
  initial: string;
  name: string;
}

export interface StudentsInfo {
  totalStudents: number;
  studentInitials: StudentInitial[];
}

export interface PettyCashSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  available: number;
  percentageChange: number;
}

export interface InterestLink {
  name: string;
  url: string;
  description: string;
  order: number;
  id: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PendingCollection {
  id: string;
  name: string;
  collectionTypeName: string;
  totalAmount: number;
  pendingAmount: number;
  totalStudents: number;
  pendingStudents: number;
  completionPercentage: number;
}

export interface PendingCollectionsData {
  topCollections: PendingCollection[];
  remainingPendingCollections: number;
}

export interface DashboardData {
  pendingPayments: PendingPaymentsData;
  studentsInfo: StudentsInfo;
  pettyCashSummary: PettyCashSummary;
  interestLinks: InterestLink[];
  topPendingCollections: PendingCollectionsData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/api/v1/Dashboard`);
  }
}
