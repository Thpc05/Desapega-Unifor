import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Nome de um bloco em public/ (ex.: "grass_block_side") → botão com fundo de textura. */
  texture?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  texture,
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  className,
  style,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.btn,
    texture ? styles.textured : styles[variant], // textura substitui a cor da variant
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const finalStyle: CSSProperties | undefined = texture
    ? { ...style, backgroundImage: `url(/${texture}.png)` }
    : style;

  return (
    <button
      className={classes}
      style={finalStyle}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        '…'
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
