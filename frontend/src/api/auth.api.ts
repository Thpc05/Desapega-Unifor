import { api } from './client';
import type { User } from '../types';

/** Corpo do cadastro (espelha o registerSchema do backend). */
export interface RegisterInput {
  matricula: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  course?: string;
  semester?: number;
}

export interface AuthResult {
  user: User;
  token: string;
}

export const authApi = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const { data } = await api.post<AuthResult>('/auth/register', input);
    return data;
  },

  async login(matricula: string, password: string): Promise<AuthResult> {
    const { data } = await api.post<AuthResult>('/auth/login', { matricula, password });
    return data;
  },

  /** Quem é o usuário do token atual (usado pra "hidratar" a sessão ao abrir a app). */
  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
