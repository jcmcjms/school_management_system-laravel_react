import { toast } from 'sonner';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const handleApiError = (error: unknown, defaultMessage = 'Something went wrong'): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    if (axiosError.response?.data?.message) {
      const message = axiosError.response.data.message;
      toast.error(message);
      return message;
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as Error).message;
    toast.error(message);
    return message;
  }

  toast.error(defaultMessage);
  return defaultMessage;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error !== null && typeof error === 'object' && 'message' in error;
};

export const extractErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Error).message);
  }

  return 'An unexpected error occurred';
};

export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
    return axiosError.response?.data?.errors ?? {};
  }
  return {};
};

export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  return searchParams.toString();
};

export const parseQueryParams = (searchParams: URLSearchParams): Record<string, string> => {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};
