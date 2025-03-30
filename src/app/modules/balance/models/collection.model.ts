import { CollectionType } from "./collection-type.model";

export interface CollectionResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Collection[]>;
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

export interface Collection {
  id?: string;
  collectionTypeId: string;
  collectionType: CollectionType;
  name?: string;
  totalAmount: number;
  individualAmount: number;
  adjustedIndividualAmount?: number;
  totalSurplus?: number;
  date: string;
  studentQuantity: string;
  percentagePaid: number;
  allowsExemptions?: boolean;
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
