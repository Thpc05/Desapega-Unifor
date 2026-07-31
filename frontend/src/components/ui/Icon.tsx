import type { CSSProperties } from 'react';

/**
 * Sprite pixelado do /public (ícones do GUI do Minecraft).
 * `name` = nome do arquivo sem .png. `size` em px (default 16).
 */
export function Icon({
  name,
  size = 16,
  width,
  height,
  alt = '',
  style,
}: {
  name: string;
  /** tamanho quadrado (px). Ignore se passar width/height (sprites não-quadrados). */
  size?: number;
  width?: number;
  height?: number;
  alt?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={`/${name}.png`}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      width={width ?? size}
      height={height ?? size}
      style={{ imageRendering: 'pixelated', display: 'block', ...style }}
    />
  );
}
