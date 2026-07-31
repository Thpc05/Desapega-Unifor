import { useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { ReviewCard } from '../components/item/ReviewCard';
import { Loading, ErrorState } from '../components/ui/State';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { reviewsApi } from '../api/reviews.api';
import { itemIdFromReviewId, refId } from '../utils/review';

export function ReadReview() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const itemId = reviewId ? itemIdFromReviewId(reviewId) : '';
  const { data: reviews, loading, error, refetch } = useAsync(
    () => reviewsApi.listForItem(itemId),
    [itemId],
  );

  if (loading) return <Loading label="Carregando avaliação…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const review = reviews?.find((r) => r._id === reviewId);
  if (!review) {
    return (
      <Panel padded style={{ maxWidth: 520, margin: '0 auto' }}>
        <p>Avaliação não encontrada.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
          Voltar
        </Button>
      </Panel>
    );
  }

  // A avaliação é sobre MIM? E ainda não avaliei de volta?
  const meId = user?.matricula;
  const aboutMe = meId != null && refId(review.reviewee) === meId;
  const iReviewedBack = reviews?.some((r) => refId(r.reviewer) === meId);
  const canReviewBack = aboutMe && !iReviewedBack;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
        ← Voltar
      </Button>
      <h1>Avaliação</h1>
      <ReviewCard
        review={review}
        showItem
        actions={
          canReviewBack ? (
            <Button size="sm" variant="primary" onClick={() => navigate(`/avaliar/${itemId}`)}>
              Avaliar de volta
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
