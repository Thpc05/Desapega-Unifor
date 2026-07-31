import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Price } from '../components/ui/Price';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { XpBadge } from '../components/ui/XpBar';
import { Icon } from '../components/ui/Icon';
import { Avatar } from '../components/ui/Avatar';
import { Loading, ErrorState } from '../components/ui/State';
import { useItem } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { itemsApi } from '../api/items.api';
import { apiErrorMessage } from '../api/client';
import { itemImage, ownerOf } from '../utils/item';
import styles from './ItemDetail.module.css';

export function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { data: item, loading, error, refetch } = useItem(id);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <Loading label="Carregando item…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!item) return null;

  const owner = ownerOf(item);
  const img = itemImage(item);
  const isMine = user && owner && user.matricula === owner._id;

  async function handleInterest() {
    if (!isLoggedIn) {
      navigate('/entrar');
      return;
    }
    setSending(true);
    setActionError(null);
    try {
      const convo = await itemsApi.interest(item!._id);
      navigate(`/chat/${convo._id}`);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <Button
        className={styles.back}
        variant="ghost"
        size="sm"
        icon={<Icon name="page_backward" width={26} height={15} />}
        onClick={() => navigate(-1)}
      >
        Voltar
      </Button>

      <div className={styles.grid}>
        <Panel elevated style={{ padding: 8 }}>
          {img ? (
            <img className={`${styles.photo} pixel`} src={img} alt={item.title} />
          ) : (
            <div className={styles.photo} />
          )}
        </Panel>

        <Panel elevated className={styles.info}>
          <h1 className={styles.title}>{item.title}</h1>

          <div className={styles.priceRow}>
            <Price value={item.type === 'donation' ? undefined : item.price} />
            <CategoryIcon category={item.category} />
          </div>

          <p className={styles.desc}>{item.description}</p>

          <hr className={styles.divider} />

          {owner && (
            <Panel as={Link} to={`/perfil/${owner._id}`} interactive className={styles.seller}>
              <Avatar url={owner.avatarUrl} name={owner.name} size={44} />
              <span className={styles.sellerMeta}>
                <span className={styles.sellerName}>{owner.name}</span>
                {owner.course && (
                  <span className={styles.sellerSub}>
                    {owner.course}
                    {owner.semester ? ` · ${owner.semester}º sem.` : ''}
                  </span>
                )}
              </span>
              <span style={{ marginLeft: 'auto' }}>
                <XpBadge xp={owner.xp} />
              </span>
            </Panel>
          )}

          {actionError && <ErrorState message={actionError} />}

          {isMine ? (
            <>
              {item.status !== 'concluded' && (
                <Button variant="primary" size="lg" fullWidth onClick={() => navigate(`/editar/${item._id}`)}>
                  Editar anúncio
                </Button>
              )}
              <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/meus')}>
                Gerenciar meu anúncio
              </Button>
            </>
          ) : (
            <Button
              texture="cobblestone"
              size="lg"
              fullWidth
              icon={<Icon name="chat" size={18} />}
              loading={sending}
              onClick={handleInterest}
            >
              Tenho interesse
            </Button>
          )}
        </Panel>
      </div>
    </div>
  );
}
