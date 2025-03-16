export interface Student {
  name: string;
  avatar: string;
  id: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StudentResponse {
  success: boolean;
  message: string;
  data: Student[];
}