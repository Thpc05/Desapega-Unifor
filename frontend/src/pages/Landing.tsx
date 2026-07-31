import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { ItemCard } from '../components/item/ItemCard';
import { Loading, ErrorState, EmptyState } from '../components/ui/State';
import { Icon } from '../components/ui/Icon';
import { CraftPlus } from '../components/ui/CraftPlus';
import { useItems } from '../hooks/queries';
import { CATEGORY_ORDER, CATEGORY_SHORT } from '../constants';
import type { ItemCategory, ItemType } from '../types';
import styles from './Landing.module.css';

type CatFilter = ItemCategory | 'all';
type TypeFilter = 'all' | ItemType;

export function Landing() {
  const navigate = useNavigate();
  const [cat, setCat] = useState<CatFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [q, setQ] = useState('');

  // Monta o objeto de filtros que vai pra API (undefined = "sem filtro").
  const filters = useMemo(
    () => ({
      category: cat === 'all' ? undefined : cat,
      type: type === 'all' ? undefined : type,
    }),
    [cat, type],
  );
  const { data: items, loading, error, refetch } = useItems(filters);

  // Busca por título é client-side (sobre os itens já carregados).
  const term = q.trim().toLowerCase();
  const shown = (items ?? []).filter((i) => i.title.toLowerCase().includes(term));

  return (
    <div className={styles.page}>
      {/* Hero */}
      <Panel as="section" elevated className={styles.hero}>
        <h1 className={styles.heroTitle}>Hmm</h1>
        <p className={styles.heroSub}>
          A economia circular da vila. Anuncie o que não usa mais, doe ou venda por
          esmeraldas, e ajude outros villagers. ⛏
        </p>
        <div className={styles.heroActions}>
          <Button variant="plain" icon={<CraftPlus />} onClick={() => navigate('/anunciar')}>
            Anunciar item
          </Button>
          <Button variant="secondary" onClick={() => setType('donation')}>
            Ver doações
          </Button>
        </div>
      </Panel>

      {/* Filtros */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Icon name="search" size={16} style={{ opacity: 0.7 }} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por título..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <Chip active={type === 'all'} onClick={() => setType('all')}>Tudo</Chip>
          <Chip active={type === 'sale'} onClick={() => setType('sale')}>À venda</Chip>
          <Chip active={type === 'donation'} onClick={() => setType('donation')}>Doações</Chip>
        </div>
        <div className={styles.filters}>
          <Chip active={cat === 'all'} onClick={() => setCat('all')}>Todas</Chip>
          {CATEGORY_ORDER.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {CATEGORY_SHORT[c]}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grade (loading / erro / vazio / dados) */}
      {loading ? (
        <Loading label="Buscando anúncios…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : shown.length > 0 ? (
        <div className={styles.grid}>
          {shown.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      ) : term ? (
        <EmptyState>Nenhum item encontrado para "{q}".</EmptyState>
      ) : (
        <EmptyState>Nenhum item por aqui ainda. Que tal ser o primeiro a anunciar?</EmptyState>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button size="sm" variant={active ? 'primary' : 'secondary'} onClick={onClick}>
      {children}
    </Button>
  );
}
