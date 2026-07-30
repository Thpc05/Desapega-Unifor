import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '../api/client';

/**
 * useAsync = hook genérico pra QUALQUER busca assíncrona (reuso em toda a app).
 *
 * Recebe uma função que devolve uma Promise e cuida do ciclo:
 *   loading (buscando) → data (deu certo) | error (falhou), com refetch.
 *
 * `deps` = quando refazer a busca (ex.: mudou o id/filtro). Igual ao array
 * de dependências de um useEffect.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    let alive = true; // evita setState depois do componente desmontar
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err) => {
        if (alive) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);

  return { data, loading, error, refetch: run };
}
