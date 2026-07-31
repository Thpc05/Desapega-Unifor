import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { XpMeter } from '../components/ui/XpBar';
import { computeLevel } from '../utils/level';
import { ItemCard } from '../components/item/ItemCard';
import { ReviewCard } from '../components/item/ReviewCard';
import { Loading, ErrorState } from '../components/ui/State';
import { useItems, useProfile } from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { imagesApi } from '../api/images.api';
import { usersApi } from '../api/users.api';
import { apiErrorMessage } from '../api/client';
import styles from './Profile.module.css';

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
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { data: profile, loading, error, refetch } = useProfile(matricula);
  const { data: items } = useItems({ owner: matricula });
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Troca de foto: sobe pro Cloudinary e salva a URL no perfil.
  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const [img] = await imagesApi.upload([file]);
      await usersApi.updateMe({ avatarUrl: img.url });
      await refreshUser();
      refetch();
    } catch (err) {
      setAvatarError(apiErrorMessage(err));
    } finally {
      setAvatarBusy(false);
    }
  }

  if (loading) return <Loading label="Carregando perfil…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!profile) return null;

  const avatarInner = profile.avatarUrl ? (
    <img className={styles.avatarImg} src={profile.avatarUrl} alt={profile.name} />
  ) : (
    profile.name.charAt(0)
  );

  return (
    <div className={styles.page}>
      <Panel elevated className={styles.header}>
        <div className={styles.top}>
          {isMe ? (
            <button type="button" className={styles.avatar} onClick={() => fileRef.current?.click()} title="Trocar foto">
              {avatarInner}
              <span className={styles.avatarEdit}>📷</span>
              {avatarBusy && <span className={styles.avatarBusy}>…</span>}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarPick} />
            </button>
          ) : (
            <span className={styles.avatar}>{avatarInner}</span>
          )}
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
        {avatarError && <ErrorState message={avatarError} />}
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <div className={styles.xpWrap}>
          <span className={styles.xpCaption}>
            Nível {computeLevel(profile.xp)} · {profile.xp} XP
          </span>
          <XpMeter xp={profile.xp} />
        </div>
        {isMe && (
          <div className={styles.meActions}>
            <Button variant="plain" size="sm" onClick={() => navigate('/meus')}>
              Meus anúncios
            </Button>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Sair
            </Button>
          </div>
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
            profile.reviews.map((r) => {
              const itemId = typeof r.item === 'object' ? r.item._id : r.item;
              return (
                <ReviewCard
                  key={r._id}
                  review={r}
                  showItem
                  actions={
                    <>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/review/${r._id}`)}>
                        Ver
                      </Button>
                      {/* avaliações no MEU perfil são sobre mim → posso avaliar de volta */}
                      {isMe && (
                        <Button size="sm" variant="primary" onClick={() => navigate(`/avaliar/${itemId}`)}>
                          Avaliar
                        </Button>
                      )}
                    </>
                  }
                />
              );
            })
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
