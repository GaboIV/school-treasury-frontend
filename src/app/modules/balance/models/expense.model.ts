import { CollectionType } from "./collection-type.model";

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
  name?: string;
  amount: number;
  date: string;
  description?: string;
  images: { id: string; url: string }[];
  createdAt?: string;
  updatedAt?: string;
  status: boolean;
}