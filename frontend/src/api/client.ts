import axios from 'axios';
import { translateError } from './errorMessages';

/**
 * CLIENT = uma instância única do axios que TODA a app usa pra falar com a API.
 *
 * Por que uma instância própria (e não o axios "cru")?
 *  - baseURL: escrevemos só o caminho ('/item/available') em vez da URL inteira.
 *  - interceptors: "ganchos" que rodam automaticamente em toda requisição/resposta.
 *    Assim o token é anexado num lugar só, e o 401 é tratado num lugar só.
 */

// tira barra(s) no final pra não gerar "https://site//api" ao concatenar.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/+$/, '');

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
 * Formato dos erros que o backend devolve (error.middleware):
 *   { error: 'mensagem', issues?: [{ field, error }] }
 * `issues` só vem em erro de validação (Zod), com o detalhe de cada campo.
 */
interface ApiErrorBody {
  error?: string;
  issues?: { field: string; error: string }[];
}

/**
 * Transforma QUALQUER erro numa mensagem clara e em PT para exibir ao usuário.
 * Ordem: sem resposta (rede/servidor fora) → detalhe de validação → mensagem de
 * negócio do backend → fallback pelo status.
 */
export function apiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Erro inesperado';

  // Sem `response` = a requisição não chegou (sem internet, servidor dormindo/fora, CORS).
  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.';
  }

  const data = error.response.data as ApiErrorBody | undefined;

  // Erro de validação: mostra o(s) detalhe(s) específico(s) de cada campo.
  if (data?.issues?.length) {
    return data.issues.map((i) => translateError(i.error)).join(' · ');
  }

  // Erro de regra de negócio (409/403/404/401): usa a mensagem do backend, traduzida.
  if (data?.error) return translateError(data.error);

  // Último recurso: identifica pelo código de status.
  return `Erro ${error.response.status}. Tente novamente.`;
}
