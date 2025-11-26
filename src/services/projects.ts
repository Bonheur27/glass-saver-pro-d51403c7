import { apiClient } from './api';
import { StockSheet, Piece, OptimizationResult } from '@/types/optimizer';

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  sheet_count?: number;
  piece_count?: number;
  last_efficiency?: number;
}

export interface ProjectDetails extends Project {
  stockSheets: StockSheet[];
  pieces: Piece[];
  optimizationResult: OptimizationResult | null;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  stockSheets: StockSheet[];
  pieces: Piece[];
  optimizationResult?: OptimizationResult;
}

export const projectsService = {
  async getAll(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  },

  async getById(id: number): Promise<ProjectDetails> {
    return apiClient.get<ProjectDetails>(`/projects/${id}`);
  },

  async create(data: CreateProjectData): Promise<{ id: number; name: string }> {
    return apiClient.post<{ id: number; name: string }>('/projects', data);
  },

  async update(id: number, data: CreateProjectData): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/projects/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/projects/${id}`);
  },

  async export(id: number): Promise<any> {
    return apiClient.get<any>(`/projects/${id}/export`);
  },

  async share(id: number, email: string, permission: string = 'view'): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/projects/${id}/share`, { email, permission });
  },
};

export const analyticsService = {
  async getDashboard(): Promise<any> {
    return apiClient.get<any>('/analytics/dashboard');
  },

  async getTrends(): Promise<any> {
    return apiClient.get<any>('/analytics/trends');
  },

  async getSummary(): Promise<any> {
    return apiClient.get<any>('/analytics/summary');
  },
};
