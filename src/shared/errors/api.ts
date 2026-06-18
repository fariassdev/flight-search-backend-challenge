export interface ApiError {
  status: 'error';
  code: string;
  message: string;
}

export interface ValidationError extends ApiError {
  errors: Record<string, string[] | undefined>;
}
