export interface CollectionTypeResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<CollectionType[]>;
}

export interface CollectionTypeAll {
  success: boolean;
  message: string;
  data: CollectionType[];
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

export interface CollectionType {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
