export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
