import { Outlet } from 'react-router-dom';
import { DynamicIsland } from './DynamicIsland';
import styles from './AppShell.module.css';

/** Casca do app: área de conteúdo (rotas via <Outlet/>) + navegação flutuante. */
export function AppShell() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <DynamicIsland />
    </div>
  );
}
