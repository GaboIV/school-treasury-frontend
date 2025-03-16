import { Collection } from './collection.model';

export interface StudentPaymentResponse {
  success: boolean;
  message: string;
  data: StudentPayment[];
}

export interface StudentPayment {
  id: string;
  collectionId: string;
  studentId: string;
  studentName: string;
  collectionName: string;
  amountCollection: number;
  adjustedAmountCollection?: number;
  amountPaid: number;
  surplus: number;
  paymentStatus: number;
  images: string[];
  voucher: string | null;
  excedent: number;
  pending: number;
  comment: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  Pending = 0,
  Partial = 1,
  Paid = 2,
  Excedent = 3
}
