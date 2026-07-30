import { Navigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { XpBar } from '../components/ui/XpBar';
import { ItemCard } from '../components/item/ItemCard';
import { Loading, ErrorState } from '../components/ui/State';
import { useItems, useProfile } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import type { Review } from '../types';
import styles from './Profile.module.css';

/** Estrelas cheias/vazias a partir da nota (função pura de render). */
function stars(avg: number) {
  const full = Math.round(avg);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

/** Nome do avaliador (pode vir populado {name} ou como matrícula). */
function reviewerName(r: Review): string {
  return typeof r.reviewer === 'object' ? r.reviewer.name : r.reviewer;
}

export function Profile() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  // "me" resolve pra matrícula logada; sem login não dá pra ver "meu" perfil.
  const target = id === 'me' ? user?.matricula : id;
  if (!target) return <Navigate to="/entrar" replace />;

  const isMe = user?.matricula === target;
  return <ProfileView matricula={target} isMe={isMe} onLogout={logout} />;
}

function ProfileView({
  matricula,
  isMe,
  onLogout,
}: {
  matricula: string;
  isMe: boolean;
  onLogout: () => void;
}) {
  const { data: profile, loading, error, refetch } = useProfile(matricula);
  const { data: items } = useItems({ owner: matricula });

  if (loading) return <Loading label="Carregando perfil…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!profile) return null;

  return (
    <div className={styles.page}>
      <Panel elevated className={styles.header}>
        <div className={styles.top}>
          <span className={styles.avatar}>{profile.name.charAt(0)}</span>
          <div className={styles.ident}>
            <h1 className={styles.name}>
              {profile.name} {isMe && <small>(você)</small>}
            </h1>
            {profile.course && (
              <span className={styles.course}>
                {profile.course}
                {profile.semester ? ` · ${profile.semester}º semestre` : ''}
              </span>
            )}
          </div>
        </div>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <XpBar xp={profile.xp} />
        {isMe && (
          <Button variant="secondary" size="sm" onClick={onLogout}>
            Sair
          </Button>
        )}
      </Panel>

      <div className={styles.stats}>
        <Panel className={styles.stat}>
          <span className={styles.statNum}>{profile.salesCount}</span>
          <span className={styles.statLabel}>vendas</span>
        </Panel>
        <Panel className={styles.stat}>
          <span className={styles.statNum}>{profile.donationCount}</span>
          <span className={styles.statLabel}>doações</span>
        </Panel>
        <Panel className={styles.stat}>
          <span className={styles.statNum}>{profile.avgXpRating.toFixed(1)}</span>
          <span className={styles.statLabel}>nota média</span>
        </Panel>
      </div>

      <section>
        <h2 className={styles.sectionTitle}>Avaliações ({profile.xpRatingCount})</h2>
        <div className={styles.reviews} style={{ marginTop: 12 }}>
          {profile.reviews.length > 0 ? (
            profile.reviews.map((r) => (
              <Panel key={r._id} className={styles.review}>
                <div className={styles.reviewTop}>
                  <span className={styles.reviewer}>{reviewerName(r)}</span>
                  <span className={styles.stars} title={`${r.xpRating} de 5`}>
                    {stars(r.xpRating)}
                  </span>
                </div>
                {r.comment && <span className={styles.comment}>{r.comment}</span>}
              </Panel>
            ))
          ) : (
            <span className={styles.comment}>Ainda sem avaliações.</span>
          )}
        </div>
      </section>

      {items && items.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Anúncios de {profile.name}</h2>
          <div className={styles.grid} style={{ marginTop: 12 }}>
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
