import { apiClient } from '../client';
import { LoginDto, RegisterDto } from '../../schemas/auth.schema';
import { Role } from '../../store/useAuthStore';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
  };
}

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },
};