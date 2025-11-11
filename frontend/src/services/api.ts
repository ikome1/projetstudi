import axios from 'axios';
import { Movie, MovieInput } from '@types/Movie';
import { AuthResponse, LoginPayload } from '@types/auth';
import { User } from '@types/User';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export const movieService = {
  async list(params?: { search?: string; genre?: string; sortBy?: string }) {
    const response = await api.get<Movie[]>('/movies', { params });
    return response.data;
  },
  async get(id: number) {
    const response = await api.get<Movie>(`/movies/${id}`);
    return response.data;
  },
  async create(payload: MovieInput) {
    const response = await api.post<Movie>('/movies', payload);
    return response.data;
  },
  async update(id: number, payload: MovieInput) {
    const response = await api.put<Movie>(`/movies/${id}`, payload);
    return response.data;
  },
  async remove(id: number) {
    await api.delete(`/movies/${id}`);
  }
};

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  }
};

export const adminService = {
  async listUsers() {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },
  async createUser(payload: { name: string; email: string; password: string; role: string }) {
    const response = await api.post<User>('/admin/users', payload);
    return response.data;
  },
  async updateUserRole(id: number, role: string) {
    const response = await api.patch<User>(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  async deleteUser(id: number) {
    await api.delete(`/admin/users/${id}`);
  },
  async uploadPoster(file: File) {
    const formData = new FormData();
    formData.append('poster', file);
    const response = await api.post<{ url: string }>('/admin/upload/poster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  }
};

export default api;

