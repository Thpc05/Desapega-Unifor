import { Link } from 'react-router-dom';
import { Panel } from '../ui/Panel';
import { Price } from '../ui/Price';
import { CategoryIcon } from '../ui/CategoryIcon';
import { XpMeter } from '../ui/XpBar';
import type { Item } from '../../types';
import { itemImage, ownerOf } from '../../utils/item';
import styles from './ItemCard.module.css';

/** Card de anúncio da vitrine (dado real da API; owner vem populado). */
export function ItemCard({ item }: { item: Item }) {
  const owner = ownerOf(item);
  const img = itemImage(item);

  return (
    <Panel as={Link} to={`/item/${item._id}`} interactive className={styles.card}>
      <div className={styles.imgWrap}>
        {img ? (
          <img className={`${styles.img} pixel`} src={img} alt={item.title} loading="lazy" />
        ) : (
          <div className={styles.img} />
        )}
        {item.type === 'donation' && <span className={styles.tag}>Doação</span>}
      </div>

      <div className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        <div className={styles.meta}>
          <Price value={item.type === 'donation' ? undefined : item.price} />
          <CategoryIcon category={item.category} showLabel={false} />
        </div>
        <div className={styles.foot}>
          <span className={styles.seller}>por {owner?.name ?? '—'}</span>
        </div>
        {/* Barra de XP do vendedor (nível logo acima) */}
        <XpMeter xp={owner?.xp ?? 0} />
      </div>
    </Panel>
  );
}
