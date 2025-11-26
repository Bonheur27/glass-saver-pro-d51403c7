import { apiClient } from './api';

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', {
      email,
      password,
      name,
    });
    
    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
