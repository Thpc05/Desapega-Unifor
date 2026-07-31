import { api } from './client';
import type { PublicProfile, User } from '../types';

/** Campos editáveis do próprio perfil. */
export interface UpdateMeInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  course?: string;
  semester?: number;
}

export const usersApi = {
  /** Perfil público (xp, nota, históricos, reviews). */
  async getProfile(matricula: string): Promise<PublicProfile> {
    const { data } = await api.get<PublicProfile>(`/user/${matricula}`);
    return data;
  },

  async updateMe(input: UpdateMeInput): Promise<User> {
    const { data } = await api.patch<User>('/user/me', input);
    return data;
  },
};
