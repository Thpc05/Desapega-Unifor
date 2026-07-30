import axios from 'axios';

/**
 * CLIENT = uma instância única do axios que TODA a app usa pra falar com a API.
 *
 * Por que uma instância própria (e não o axios "cru")?
 *  - baseURL: escrevemos só o caminho ('/item/available') em vez da URL inteira.
 *  - interceptors: "ganchos" que rodam automaticamente em toda requisição/resposta.
 *    Assim o token é anexado num lugar só, e o 401 é tratado num lugar só.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const api = axios.create({
  baseURL: `${BASE}/api`,
});

/* ---------- Token: onde guardamos e como lemos ---------- */

const TOKEN_KEY = 'desapego_token';

/**
 * O token fica no localStorage (persiste entre recarregamentos/abas).
 * É um JWT assinado pelo backend; o browser só o guarda e reenvia — quem valida
 * é o servidor. (Trade-off conhecido: localStorage é legível por JS; para este
 * projeto acadêmico é o suficiente, dá pra explicar a alternativa httpOnly cookie.)
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/* ---------- Interceptors ---------- */

// REQUEST: antes de cada requisição sair, anexa "Authorization: Bearer <token>".
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: se o backend responder 401 (token inválido/expirado), limpamos o
// token e avisamos a app (o AuthContext escuta esse evento e faz logout).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setToken(null);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

/**
 * Extrai a mensagem de erro que o backend mandou (ou uma genérica).
 * O backend responde erros como { message: '...' } via error.middleware.
 */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? 'Falha na conexão com o servidor';
  }
  return 'Erro inesperado';
}
