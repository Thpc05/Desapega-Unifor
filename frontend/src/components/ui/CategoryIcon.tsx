import { CATEGORY_LABELS, CATEGORY_TEXTURE } from '../../constants';
import type { ItemCategory } from '../../types';
import styles from './CategoryIcon.module.css';

/** Selo de categoria: mini-sprite do bloco da categoria + rótulo (opcional). */
export function CategoryIcon({
  category,
  showLabel = true,
}: {
  category: ItemCategory;
  showLabel?: boolean;
}) {
  return (
    <span className={styles.wrap} title={CATEGORY_LABELS[category]}>
      <img
        className={styles.icon}
        src={`/${CATEGORY_TEXTURE[category]}.png`}
        alt=""
        aria-hidden="true"
      />
      {showLabel && <span className={styles.label}>{CATEGORY_LABELS[category]}</span>}
    </span>
  );
}
