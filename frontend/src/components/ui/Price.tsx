import styles from './Price.module.css';

/**
 * Preço em ESMERALDAS (a moeda do app). Mostra o ícone da esmeralda + o número.
 * Sem preço (doação) → mostra "Doação".
 */
export function Price({ value }: { value?: number }) {
  if (value === undefined || value === null) {
    return <span className={styles.donation}>Doação</span>;
  }
  return (
    <span className={styles.price}>
      <img className={styles.gem} src="/emerald.png" alt="esmeraldas" />
      {value}
    </span>
  );
}
