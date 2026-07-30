import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './Panel.module.css';

/** Panel = superfície-base do tema (polimórfica via `as`): card, container, painel. */
type PanelOwnProps<E extends ElementType> = {
  as?: E;
  elevated?: boolean;
  padded?: boolean;
  interactive?: boolean;
  children?: ReactNode;
};

type PanelProps<E extends ElementType> = PanelOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof PanelOwnProps<E>>;

export function Panel<E extends ElementType = 'div'>({
  as,
  elevated = false,
  padded = false,
  interactive = false,
  className,
  children,
  ...rest
}: PanelProps<E>) {
  const Comp: ElementType = as || 'div';
  const classes = [
    styles.panel,
    elevated && styles.elevated,
    padded && styles.padded,
    interactive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Comp className={classes} {...rest}>
      {children}
    </Comp>
  );
}
