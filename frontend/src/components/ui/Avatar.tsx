import styles from './Avatar.module.css';

/**
 * Avatar do usuário: mostra a foto (avatarUrl) ou a 1ª letra do nome como fallback.
 * Reusado em todo canto que exibe uma pessoa (detalhe, inbox, chat, reviews).
 */
export function Avatar({
  url,
  name,
  size = 44,
}: {
  url?: string | null;
  name?: string;
  size?: number;
}) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {url ? (
        <img className={styles.img} src={url} alt={name ?? ''} />
      ) : (
        (name ?? '?').charAt(0)
      )}
    </span>
  );
}
