import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getToken, setToken } from '../api/client';
import { authApi, type RegisterInput } from '../api/auth.api';
import type { User } from '../types';

/**
 * AuthContext = a "sessão" da app compartilhada por qualquer componente.
 *
 * Guarda { user, token } e expõe login/register/logout. O token vive no
 * localStorage (via api/client); aqui guardamos o USER em memória e o
 * reidratamos ao abrir a app (GET /auth/me), pois só o token persiste no disco.
 */
interface AuthContextValue {
  user: User | null;
  loading: boolean; // true enquanto tentamos reidratar a sessão no boot
  isLoggedIn: boolean;
  login: (matricula: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // BOOT: se há token salvo, pergunta ao backend quem é o dono dele.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => setToken(null)) // token velho/inválido → descarta
      .finally(() => setLoading(false));
  }, []);

  // Se qualquer request tomar 401, o interceptor dispara este evento → deslogamos.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  async function login(matricula: string, password: string) {
    const { user, token } = await authApi.login(matricula, password);
    setToken(token);
    setUser(user);
  }

  async function register(input: RegisterInput) {
    const { user, token } = await authApi.register(input);
    setToken(token);
    setUser(user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  /** Re-busca o usuário logado (ex.: após atualizar perfil/foto). */
  async function refreshUser() {
    if (!getToken()) return;
    const fresh = await authApi.me();
    setUser(fresh);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isLoggedIn: Boolean(user), login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook de acesso à sessão. Erra cedo se usado fora do provider (pega bug na hora). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
