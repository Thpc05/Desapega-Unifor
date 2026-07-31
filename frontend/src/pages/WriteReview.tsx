import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Field';
import { StarsInput } from '../components/ui/Stars';
import { Loading, ErrorState } from '../components/ui/State';
import { useItem } from '../hooks/queries';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { reviewsApi } from '../api/reviews.api';
import { apiErrorMessage } from '../api/client';
import { buyerId, buyerName, isReviewable, ownerId, ownerOf } from '../utils/item';
import { makeReviewId, refId } from '../utils/review';
import styles from './WriteReview.module.css';

export function WriteReview() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: item, loading, error, refetch } = useItem(itemId);
  const reviews = useAsync(() => reviewsApi.listForItem(itemId!), [itemId]);

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (loading) return <Loading label="Carregando negócio…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!item || !user) return null;

  const meId = user.matricula;
  const oId = ownerId(item);
  const bId = buyerId(item);
  const iAmParty = meId === oId || meId === bId;

  if (!isReviewable(item) || !iAmParty) {
    return (
      <div className={styles.page}>
        <Panel padded>
          <p>Este negócio não pode ser avaliado (só vendas concluídas com comprador).</p>
          <Button variant="secondary" onClick={() => navigate('/meus')} style={{ marginTop: 12 }}>
            Voltar
          </Button>
        </Panel>
      </div>
    );
  }

  // Contraparte = o outro lado do negócio.
  const counterpartName = meId === oId ? buyerName(item) : ownerOf(item)?.name ?? '';

  // Já avaliei este negócio?
  const alreadyMine = reviews.data?.find((r) => refId(r.reviewer) === meId);
  if (alreadyMine) {
    return (
      <div className={styles.page}>
        <Panel padded>
          <p>Você já avaliou este negócio. ✅</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <Button variant="primary" onClick={() => navigate(`/review/${alreadyMine._id}`)}>
              Ver minha avaliação
            </Button>
            <Button variant="secondary" onClick={() => navigate('/perfil/me')}>
              Voltar ao perfil
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSubmitting(true);
    try {
      await reviewsApi.create(itemId!, { xpRating: stars, comment: comment.trim() || undefined, visibility });
      navigate(`/review/${makeReviewId(itemId!, meId)}`, { replace: true });
    } catch (err) {
      setServerError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Avaliar negócio</h1>
      <Panel elevated className={styles.card}>
        <div className={styles.target}>
          <span className={styles.avatar}>{(counterpartName || '?').charAt(0)}</span>
          <div className={styles.targetMeta}>
            <span className={styles.targetName}>{counterpartName || 'Contraparte'}</span>
            <span className={styles.targetSub}>{item.title}</span>
          </div>
        </div>

        <form className={styles.card} style={{ padding: 0, gap: 18 }} onSubmit={submit}>
          <div className={styles.block}>
            <span className={styles.blockLabel}>Sua nota</span>
            <StarsInput value={stars} onChange={setStars} />
          </div>

          <div className={styles.block}>
            <span className={styles.blockLabel}>Comentário (opcional)</span>
            <Textarea
              rows={4}
              placeholder="Como foi a negociação? O item era como descrito?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className={styles.block}>
            <span className={styles.blockLabel}>Visibilidade</span>
            <div className={styles.visRow}>
              <Button
                type="button"
                size="sm"
                variant={visibility === 'public' ? 'primary' : 'secondary'}
                onClick={() => setVisibility('public')}
              >
                Pública
              </Button>
              <Button
                type="button"
                size="sm"
                variant={visibility === 'private' ? 'primary' : 'secondary'}
                onClick={() => setVisibility('private')}
              >
                Privada
              </Button>
            </div>
          </div>

          {serverError && <ErrorState message={serverError} />}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
            Enviar avaliação
          </Button>
        </form>
      </Panel>
    </div>
  );
}
