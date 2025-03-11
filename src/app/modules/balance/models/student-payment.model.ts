import { Expense } from './expense.model';

export interface StudentPaymentResponse {
  success: boolean;
  message: string;
  data: StudentPayment[];
}

export interface StudentPayment {
  id: string;
  expenseId: string;
  studentId: string;
  studentName: string;
  expenseName: string;
  amountExpense: number;
  amountPaid: number;
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
  Paid = 1,
  Partial = 2
}
