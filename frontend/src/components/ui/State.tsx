import { Button } from './Button';
import styles from './State.module.css';

/** Estado de carregando (bloco de esmeralda pulsando). */
export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <img className={styles.spinner} src="/emerald_block.png" alt="" />
      <span>{label}</span>
    </div>
  );
}

/** Estado de erro, com botão de tentar de novo. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.wrap} role="alert">
      <img className={styles.errIcon} src="/redstone_block.png" alt="" onError={hideBrokenImg} />
      <span className={styles.errMsg}>Algo deu errado</span>
      <span>{message}</span>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

/** Estado vazio (nenhum resultado). */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <img className={styles.errIcon} src="/info.png" alt="" onError={hideBrokenImg} />
      <span>{children}</span>
    </div>
  );
}

// Se a textura do bloco não existir, some com a imagem quebrada.
function hideBrokenImg(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}
