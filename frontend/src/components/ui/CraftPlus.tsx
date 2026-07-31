/**
 * "+" dentro de uma crafting_table (quadrado perfeito) — ótimo uso de um bloco
 * NÃO contínuo. Serve de ícone pros botões de "Anunciar/Criar anúncio".
 */
export function CraftPlus({ size = 24 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        backgroundImage: 'url(/crafting_table.png)',
        backgroundSize: 'cover',
        imageRendering: 'pixelated',
        border: '1px solid var(--border)',
        color: '#fff',
        fontWeight: 900,
        fontSize: size * 0.62,
        lineHeight: 1,
        textShadow: '1px 1px 0 rgba(0,0,0,0.9)',
      }}
    >
      +
    </span>
  );
}
