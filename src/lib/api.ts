import { getEnv } from './env';
import { AppError, ErrorType, handleFetchResponse, withErrorHandling } from './error';
import { supabase } from './supabase';

const API_URL = getEnv('VITE_API_URL');

/**
 * Secure fetch function with authentication, CSRF protection, and error handling
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  securityOptions: {
    requireAuth?: boolean;
    retries?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { requireAuth = true, retries = 1, timeout = 30000 } = securityOptions;

  return withErrorHandling(async () => {
    // Get auth session if authentication is required
    if (requireAuth) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new AppError(
          'Authentication required',
          ErrorType.AUTHENTICATION
        );
      }

      // Set authentication header
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`
      };
    }

    // Add CSRF protection
    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE' || options.method === 'PATCH') {
      // Add CSRF token from cookies if available
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'X-CSRF-Token': csrfToken
        };
      }
    }

    // Set default headers
    options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include', // Include cookies for CSRF protection
      });

      clearTimeout(timeoutId);
      return await handleFetchResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AppError(
          `Request timeout after ${timeout}ms`,
          ErrorType.NETWORK,
          { endpoint }
        );
      }
      
      throw error;
    }
  }, { retries, errorType: ErrorType.API });
}

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * API client for interacting with the backend
 */
export const api = {
  /**
   * Make a GET request to the API
   */
  get: <T = any>(
    endpoint: string,
    options: Omit<RequestInit, 'method'> = {},
    securityOptions?: { requireAuth?: boolean; retries?: number; timeout?: number }
  ) => apiFetch<T>(endpoint, { ...options, method: 'GET' }, securityOptions),

  /**
   * Make a POST request to the API
   */
  post: <T = any>(
    endpoint: string,
    data: any,
    options: Omit<RequestInit, 'method' | 'body'> = {},
    securityOptions?: { requireAuth?: boolean; retries?: number; timeout?: number }
  ) => apiFetch<T>(
    endpoint,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    },
    securityOptions
  ),

  /**
   * Make a PUT request to the API
   */
  put: <T = any>(
    endpoint: string,
    data: any,
    options: Omit<RequestInit, 'method' | 'body'> = {},
    securityOptions?: { requireAuth?: boolean; retries?: number; timeout?: number }
  ) => apiFetch<T>(
    endpoint,
    {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    },
    securityOptions
  ),

  /**
   * Make a PATCH request to the API
   */
  patch: <T = any>(
    endpoint: string,
    data: any,
    options: Omit<RequestInit, 'method' | 'body'> = {},
    securityOptions?: { requireAuth?: boolean; retries?: number; timeout?: number }
  ) => apiFetch<T>(
    endpoint,
    {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    },
    securityOptions
  ),

  /**
   * Make a DELETE request to the API
   */
  delete: <T = any>(
    endpoint: string,
    options: Omit<RequestInit, 'method'> = {},
    securityOptions?: { requireAuth?: boolean; retries?: number; timeout?: number }
  ) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }, securityOptions),
}; 