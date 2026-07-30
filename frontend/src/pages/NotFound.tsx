import { useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Panel padded elevated style={{ textAlign: 'center', maxWidth: 420, margin: '10vh auto' }}>
      <h1 style={{ fontSize: '2.4rem' }}>404</h1>
      <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>
        Esse bloco não existe no mapa. 🗺
      </p>
      <Button texture="grass_block_side" onClick={() => navigate('/')}>
        Voltar à vitrine
      </Button>
    </Panel>
  );
}
