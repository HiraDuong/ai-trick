// Luvina
// Vu Huy Hoang - Dev2
export interface ApiErrorBody {
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface HttpError extends Error {
  statusCode?: number;
}