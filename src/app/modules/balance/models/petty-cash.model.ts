export interface PettyCash {
  id: number;
  balance: number;
  lastUpdated: Date;
}

export interface PettyCashDto {
  id: number;
  balance: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  date: Date;
  createdById: string | null;
  createdBy: string | null;
  relatedEntityId?: string;
  relatedEntityType?: string;
  studentId?: string;
  studentName?: string;
  expenseId?: string | null;
  expenseName?: string | null;
  paymentId?: string;
  paymentStatus?: string;
  notes?: string | null;
  previousBalance?: number;
  newBalance?: number;
}

export interface TransactionDto {
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  createdById: number;
  createdBy: string;
}

export interface CreateTransactionDto {
  amount: number;
  description: string;
  type: TransactionType;
}

export interface TransactionSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  lastTransactionDate: Date | null;
  recentTransactions?: Transaction[];
}

export interface TransactionSummaryDto {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  lastTransactionDate: string | null;
}

export enum TransactionType {
  Income = 0,
  Expense = 1,
  Exoneration = 3
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface PettyCashDtoApiResponse {
  isSuccess: boolean;
  value: PettyCashDto;
  errors: string[];
}

export interface TransactionDtoApiResponse {
  isSuccess: boolean;
  value: TransactionDto;
  errors: string[];
}

export interface TransactionSummaryDtoApiResponse {
  isSuccess: boolean;
  value: TransactionSummaryDto;
  errors: string[];
}

export interface PaginatedTransactionDtoApiResponse {
  isSuccess: boolean;
  value: PaginatedResult<TransactionDto>;
  errors: string[];
}

export interface PettyCashCommentsDto {
  balanceComment?: string | null;
  incomeComment?: string | null;
  expenseComment?: string | null;
}

export interface PettyCashCommentsDtoApiResponse {
  success: boolean;
  message: string;
  data: PettyCashCommentsDto;
}
