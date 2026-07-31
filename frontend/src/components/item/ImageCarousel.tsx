import { useEffect, useState } from 'react';
import type { ItemImage } from '../../types';
import styles from './ImageCarousel.module.css';

/**
 * Carrossel das fotos de um item (usado no detalhe).
 * - Navega entre as imagens (setas + dots), circular.
 * - Clicar na foto abre o "lightbox" (foco/zoom em tela cheia).
 * A vitrine continua mostrando só a 1ª foto (não usa este componente).
 */
export function ImageCarousel({ images, alt = '' }: { images: ItemImage[]; alt?: string }) {
  const n = images.length;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  // wrap circular (função pura)
  const go = (i: number) => setIndex(((i % n) + n) % n);
  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  // No lightbox: setas do teclado navegam, Esc fecha.
  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoom(false);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, index, n]);

  if (n === 0) return <div className={styles.placeholder} />;

  const current = images[index];

  return (
    <div className={styles.wrap}>
      <img className={styles.frame} src={current.url} alt={alt} onClick={() => setZoom(true)} />

      {n > 1 && (
        <>
          <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={prev} aria-label="Foto anterior">
            <img className={`${styles.arrow} ${styles.arrowFlip}`} src="/join.png" alt="" />
          </button>
          <button type="button" className={`${styles.nav} ${styles.next}`} onClick={next} aria-label="Próxima foto">
            <img className={styles.arrow} src="/join.png" alt="" />
          </button>
          <span className={styles.counter}>
            {index + 1}/{n}
          </span>
          <div className={styles.dots}>
            {images.map((img, i) => (
              <button
                key={img.publicId}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
                onClick={() => go(i)}
                aria-label={`Ir para a foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Lightbox: clique no fundo fecha; na imagem não. */}
      {zoom && (
        <div className={styles.lightbox} onClick={() => setZoom(false)}>
          <button type="button" className={styles.close} onClick={() => setZoom(false)} aria-label="Fechar">
            <img className={styles.closeIcon} src="/cross_button.png" alt="" />
          </button>

          {n > 1 && (
            <button
              type="button"
              className={`${styles.nav} ${styles.prev} ${styles.lightNav}`}
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Foto anterior"
            >
              <img className={`${styles.arrow} ${styles.arrowFlip}`} src="/join.png" alt="" />
            </button>
          )}

          <img className={styles.big} src={current.url} alt={alt} onClick={(e) => e.stopPropagation()} />

          {n > 1 && (
            <button
              type="button"
              className={`${styles.nav} ${styles.next} ${styles.lightNav}`}
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Próxima foto"
            >
              <img className={styles.arrow} src="/join.png" alt="" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
