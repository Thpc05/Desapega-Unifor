import styles from './Stars.module.css';

/** Exibe uma nota 0..5 em estrelas (arredonda pra estrela cheia). */
export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className={styles.stars} title={`${value} de 5`}>
      <span className={styles.star}>{'★★★★★'.slice(0, full)}</span>
      <span className={styles.star} style={{ color: 'var(--text-muted)' }}>
        {'★★★★★'.slice(0, 5 - full)}
      </span>
    </span>
  );
}

/** Estrelas clicáveis pra ESCOLHER a nota (1..5). */
export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className={`${styles.stars} ${styles.input}`} role="radiogroup" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= value ? styles.on : ''}`}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          aria-checked={n === value}
          role="radio"
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
