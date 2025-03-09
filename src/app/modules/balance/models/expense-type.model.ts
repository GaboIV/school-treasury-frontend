export interface ExpenseTypeResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<ExpenseType[]>;
}

export interface ExpenseTypeAll {
  success: boolean;
  message: string;
  data: ExpenseType[];
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

export interface ExpenseType {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
