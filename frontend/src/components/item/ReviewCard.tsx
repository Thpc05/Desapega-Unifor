import type { ReactNode } from 'react';
import { Panel } from '../ui/Panel';
import { Stars } from '../ui/Stars';
import type { Review } from '../../types';
import { refName } from '../../utils/review';

/**
 * Cartão de uma avaliação. `subtitle` (opcional) mostra o item avaliado;
 * `actions` (opcional) recebe botões (ex.: "avaliar de volta").
 */
export function ReviewCard({
  review,
  showItem = false,
  actions,
}: {
  review: Review;
  showItem?: boolean;
  actions?: ReactNode;
}) {
  const itemTitle = typeof review.item === 'object' ? review.item.title : '';
  return (
    <Panel style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontWeight: 700 }}>{refName(review.reviewer)}</span>
          {showItem && itemTitle && (
            <span style={{ fontSize: '0.74rem', color: 'var(--emerald)' }}>{itemTitle}</span>
          )}
        </div>
        <Stars value={review.xpRating} />
      </div>
      {review.comment && (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {review.comment}
        </span>
      )}
      {review.visibility === 'private' && (
        <span
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            padding: '1px 6px',
            alignSelf: 'flex-start',
          }}
        >
          privada
        </span>
      )}
      {actions && <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>{actions}</div>}
    </Panel>
  );
}
