import { NavLink } from 'react-router-dom';
import { Panel } from '../ui/Panel';
import styles from './DynamicIsland.module.css';

/**
 * Navegação flutuante ("dynamic island"), fixa embaixo.
 * Cada item = 2 andares: (1) o BLOCO que o representa, (2) o rótulo.
 */
const LINKS = [
  { to: '/', label: 'Home', block: 'grass_block_side', end: true },
  { to: '/chat', label: 'Chat', block: 'writable_book', end: false },
  { to: '/meus', label: 'Anúncios', block: 'bookshelf', end: false },
  { to: '/perfil/me', label: 'Perfil', block: 'observer', end: false },
];

export function DynamicIsland() {
  return (
    <Panel as="nav" elevated className={styles.island} aria-label="Navegação principal">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          title={l.label}
          className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
        >
          <img className={styles.block} src={`/${l.block}.png`} alt="" aria-hidden="true" />
          <span className={styles.label}>{l.label}</span>
        </NavLink>
      ))}
    </Panel>
  );
}
