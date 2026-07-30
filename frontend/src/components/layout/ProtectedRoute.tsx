import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../ui/State';

/**
 * Protege as rotas que exigem login. Se ainda estamos reidratando a sessão,
 * mostra loading; se não há usuário, manda pro /entrar (guardando de onde veio,
 * pra voltar depois do login).
 */
export function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Verificando sessão…" />;
  if (!isLoggedIn) return <Navigate to="/entrar" state={{ from: location }} replace />;

  return <Outlet />;
}
