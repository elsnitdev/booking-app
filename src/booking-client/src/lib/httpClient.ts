import { API_BASE_URL } from '../config/api';
import type { ApiResponse } from '../types/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  errors?: string[] | null;
  response?: { status: number; data?: unknown };

  constructor(message: string, status: number, data?: unknown, errors?: string[] | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.errors = errors;
    this.response = { status, data };
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  authenticated?: boolean;
  body?: unknown;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(authenticated: boolean = false, customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (authenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let result: ApiResponse<T>;

    try {
      result = await response.json();
    } catch {
      result = {
        success: response.ok,
        message: response.statusText || 'Không thể đọc phản hồi từ máy chủ.',
      };
    }

    if (!response.ok || result.success === false) {
      const message = result.message || `Yêu cầu thất bại với mã lỗi ${response.status}`;
      throw new ApiError(message, response.status, result.data, result.errors);
    }

    return result;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { authenticated = false, body, headers, ...restOptions } = options;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...restOptions,
      headers: this.getHeaders(authenticated, headers),
    };

    if (body !== undefined) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  get<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient(API_BASE_URL);
