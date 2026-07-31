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
 * Barra de XP estilo Minecraft (sprites do jogo) com o NÍVEL logo ACIMA da barra.
 * `detail` mostra também o total de XP (usado no perfil).
 */
export function XpMeter({ xp, detail = false }: { xp: number; detail?: boolean }) {
  const level = computeLevel(xp);
  const pct = Math.round(xpProgress(xp) * 100);
  return (
    <div className={styles.meterWrap} title={`Nível ${level} · ${xp} XP`}>
      <span className={styles.meterLabel}>
        <img className={styles.xpIcon} src="/experience_bottle.png" alt="" aria-hidden="true" />
        Nível {level}
        {detail ? ` · ${xp} XP` : ''}
      </span>
      <div className={styles.meter}>
        <div className={styles.meterFill} style={{ width: `${pct}%` }} />
      </div>
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
