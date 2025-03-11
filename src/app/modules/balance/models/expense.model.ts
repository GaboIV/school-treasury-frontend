import { ExpenseType } from "./expense-type.model";

export interface ExpenseResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Expense[]>;
}

export interface PaginatedResponse<T> {
  items: T;
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface Expense {
  id?: string;
  expenseTypeId: string;
  expenseType: ExpenseType;
  name?: string;
  totalAmount: number;
  individualAmount: number;
  adjustedIndividualAmount?: number;
  totalSurplus?: number;
  date: string;
  studentQuantity: string;
  percentagePaid: number;
  advance: {
    total: number;
    completed: number;
    pending: number;
  };
  images: { id: string; url: string }[];
  createdAt?: string;
  updatedAt?: string;
  status: boolean;
}
