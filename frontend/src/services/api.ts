import axios from 'axios';
import { Movie, MovieHighlight, MovieInput } from '@types/Movie';
import { AuthResponse, LoginPayload } from '@types/auth';
import { User } from '@types/User';
import { Reservation } from '@types/Reservation';

// Client Axios configuré pour tous les appels au back.
// Le proxy Vite redirige `/api` vers l’API Express en dev.
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

type MovieListParams = {
  search?: string;
  genre?: string;
  sortBy?: string;
  limit?: number;
};

export const movieService = {
  // Regroupe tous les appels liés aux films côté front.
  async list(params?: MovieListParams) {
    const response = await api.get<Movie[]>('/movies', { params });
    return response.data;
  },
  async getTodayHighlight(date?: string) {
    const response = await api.get<MovieHighlight | null>('/movies/highlight/today', {
      params: date ? { date } : undefined
    });
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
  // Endpoints nécessitant le rôle administrateur (utilisateurs + programmation).
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
  async setTodayHighlight(payload: { movieId: number | null; date?: string; startTime?: string }) {
    const response = await api.post<MovieHighlight | null>('/admin/schedule/today', payload);
    return response.data;
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

export const reservationService = {
  // Routes publiques autour de la réservation (utilisées sur la page /reservation).
  async list() {
    const response = await api.get<Reservation[]>('/reservations');
    return response.data;
  },
  async reserve(payload: { seatNumber: number }) {
    const response = await api.post<Reservation>('/reservations', payload);
    return response.data;
  }
};

export const adminReservationService = {
  // API réservée aux admins pour piloter les réservations côté dashboard.
  async list() {
    const response = await api.get<Reservation[]>('/admin/reservations');
    return response.data;
  },
  async cancel(seatNumber: number) {
    await api.delete(`/admin/reservations/${seatNumber}`);
  },
  async reset() {
    await api.post('/admin/reservations/reset', {});
  }
};

export default api;

