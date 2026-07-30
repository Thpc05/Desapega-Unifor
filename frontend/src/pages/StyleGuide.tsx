import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { XpBadge, XpBar } from '../components/ui/XpBar';
import { Price } from '../components/ui/Price';
import { CATEGORY_ORDER } from '../constants';
import styles from './StyleGuide.module.css';

const COLORS: [string, string][] = [
  ['--bg', 'Fundo'],
  ['--surface', 'Superfície'],
  ['--surface-2', 'Elevado'],
  ['--green', 'Grama'],
  ['--emerald', 'Esmeralda'],
  ['--gold', 'Dourado'],
  ['--cyan', 'Diamante'],
  ['--red', 'Redstone'],
];

export function StyleGuide() {
  return (
    <div className={styles.page}>
      <header>
        <h1>Style Guide</h1>
        <p className={styles.sub}>
          UI moderna + pixelado + Minecraft. Fonte Monocraft em tudo (com acentos),
          moeda em esmeraldas, alguns botões com textura de bloco. Aprova aqui.
        </p>
      </header>

      {/* Cores */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Cores</h3>
        <div className={styles.swatches}>
          {COLORS.map(([v, label]) => (
            <div key={v} className={styles.swatch} style={{ background: `var(${v})` }}>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Tipografia */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tipografia (Monocraft)</h3>
        <h1>Título de página — Ação, Anúncios</h1>
        <h2>Seção — h2</h2>
        <h3>Subseção — h3</h3>
        <p>
          Corpo de texto na Monocraft: legível e com todos os acentos do português —
          coração, física, jaleco, você. O clima Minecraft sem quebrar as palavras.
        </p>
        <p className={styles.demoMuted}>Texto secundário (muted) para detalhes.</p>
      </section>

      {/* Botões */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Botões (cor)</h3>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className={styles.row}>
          <Button size="sm">Pequeno</Button>
          <Button size="md">Médio</Button>
          <Button size="lg">Grande</Button>
          <Button icon="🌱">Com ícone</Button>
          <Button loading>Carregando</Button>
          <Button disabled>Off</Button>
        </div>

        <h3 className={styles.sectionTitle} style={{ marginTop: 12 }}>
          Botões com textura de bloco
        </h3>
        <div className={styles.row}>
          <Button texture="grass_block_side">Anunciar</Button>
          <Button texture="stone">Ver mais</Button>
          <Button texture="oak_planks">Madeira</Button>
          <Button texture="cobblestone" size="lg" icon="💬">Tenho interesse</Button>
        </div>
      </section>

      {/* Painéis */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Painéis</h3>
        <div className={styles.row}>
          <Panel padded>Panel padrão</Panel>
          <Panel padded elevated>Panel elevado</Panel>
          <Panel padded interactive>Panel clicável</Panel>
        </div>
      </section>

      {/* Formulário */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Formulário</h3>
        <div className={styles.fields}>
          <Field label="Matrícula"><Input placeholder="Ex.: 2312345" /></Field>
          <Field label="Categoria">
            <Select defaultValue="">
              <option value="" disabled>Selecione</option>
              <option>Livros</option>
              <option>Eletrônicos</option>
            </Select>
          </Field>
          <Field label="Descrição"><Textarea placeholder="Detalhes do item..." /></Field>
        </div>
      </section>

      {/* Acentos Minecraft + Moeda */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Acentos & Moeda</h3>
        <div className={styles.row}>
          {CATEGORY_ORDER.map((c) => (
            <CategoryIcon key={c} category={c} />
          ))}
        </div>
        <div className={styles.row}>
          <Price value={45} />
          <Price value={260} />
          <Price />
          <XpBadge xp={40} />
          <XpBadge xp={300} />
        </div>
        <Panel padded style={{ maxWidth: 360 }}>
          <XpBar xp={160} />
        </Panel>
      </section>

      {/* Card de anúncio (alvo) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Card de anúncio (alvo)</h3>
        <Panel as="article" className={styles.card}>
          <img className={styles.cardImg} src="https://picsum.photos/seed/calc/400/300" alt="" />
          <div className={styles.cardBody}>
            <span className={styles.cardTitle}>Cálculo Vol. 1 — Guidorizzi</span>
            <div className={styles.cardMeta}>
              <Price value={45} />
              <CategoryIcon category="StudyMaterial" showLabel={false} />
            </div>
            <div className={styles.cardFoot}>
              <span>por Thiago</span>
              <XpBadge xp={120} />
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
