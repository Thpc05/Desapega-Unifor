import styles from './Stars.module.css';

/** Exibe uma nota 0..5 em corações dourados (arredonda pra coração cheio). */
export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className={styles.stars} title={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <img
          key={n}
          src="/absorbing_full.png"
          alt=""
          className={`${styles.heart} ${n <= full ? '' : styles.empty}`}
        />
      ))}
    </span>
  );
}

/** Corações clicáveis pra ESCOLHER a nota (1..5). */
export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className={`${styles.stars} ${styles.input}`} role="radiogroup" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={styles.heartBtn}
          aria-label={`${n} coração${n > 1 ? 'ões' : ''}`}
          aria-checked={n === value}
          role="radio"
          onClick={() => onChange(n)}
        >
          <img src="/absorbing_full.png" alt="" className={`${styles.heartBig} ${n <= value ? '' : styles.empty}`} />
        </button>
      ))}
    </div>
  );
}
