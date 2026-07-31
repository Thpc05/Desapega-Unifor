import { computeLevel, xpForLevel, xpProgress } from '../../utils/level';
import styles from './XpBar.module.css';

/** Badge compacto (cards): bloco de esmeralda + nível. */
export function XpBadge({ xp }: { xp: number }) {
  const level = computeLevel(xp);
  return (
    <span className={styles.badge} title={`${xp} XP`}>
      <img className={styles.gem} src="/emerald_block.png" alt="" aria-hidden="true" />
      <span className={styles.level}>Nv {level}</span>
    </span>
  );
}

/**
 * Barra de XP estilo Minecraft (sprites do jogo) com o NÍVEL no meio.
 * Usada colada na borda inferior do card de anúncio.
 */
export function XpMeter({ xp }: { xp: number }) {
  const level = computeLevel(xp);
  const pct = Math.round(xpProgress(xp) * 100);
  return (
    <div className={styles.meter} title={`Nível ${level} · ${xp} XP`}>
      <div className={styles.meterFill} style={{ width: `${pct}%` }} />
      <span className={styles.meterLevel}>{level}</span>
    </div>
  );
}

/** Barra completa (perfil): nível + progresso até o próximo. */
export function XpBar({ xp }: { xp: number }) {
  const level = computeLevel(xp);
  const pct = Math.round(xpProgress(xp) * 100);
  const next = xpForLevel(level + 1);
  return (
    <div className={styles.bar}>
      <div className={styles.barTop}>
        <span className={styles.barLevel}>Nível {level}</span>
        <span>{xp} / {next} XP</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
