import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import {
  DangerButton,
  GhostButton,
  Modal,
  SecondaryButton,
  SectionHeader,
  ReviewCard,
} from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { useRequireAuth } from '@/features/auth/useRequireAuth';
import { AddReviewSheet } from '@/features/reviews/AddReviewSheet';
import type { Spot, SpotReview } from '@/features/spots/types';
import { t } from '@/i18n';
import { formatMonthDayYear } from '@/utils/dates';

type SpotReviewsProps = {
  spot: Spot;
  reviews: readonly SpotReview[];
  /** The review this athlete can change, separated from everyone else's. */
  ownReview: SpotReview | undefined;
  /** Writes or replaces this athlete's review of the spot. */
  onSaveReview: (rating: number, text: string) => Promise<void>;
  /** Removes this athlete's review of the spot. */
  onDeleteReview: () => Promise<void>;
  /** True while the write is in flight. */
  saving: boolean;
  /** True while the delete is in flight. */
  deleting: boolean;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
};

type OwnReviewBlockProps = {
  review: SpotReview;
  deleting: boolean;
  errorText: string | undefined;
  onDeletePress: () => void;
};

/** The athlete's own review, with the one action that removes it. */
function OwnReviewBlock({ review, deleting, errorText, onDeletePress }: OwnReviewBlockProps) {
  return (
    <Animated.View
      className="gap-space-8"
      entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
    >
      <Text className="font-semibold text-bodySmall text-text-secondary">
        {t('reviews.yourReview')}
      </Text>
      <ReviewCard
        authorName={review.authorName}
        dateLabel={formatMonthDayYear(review.date)}
        rating={review.rating}
        text={review.text}
      />

      {errorText === undefined ? null : (
        <Text className="text-caption text-status-bad">{errorText}</Text>
      )}

      <View className="flex-row">
        <DangerButton
          label={t('reviews.delete')}
          loading={deleting}
          onPress={onDeletePress}
          size="sm"
        />
      </View>
    </Animated.View>
  );
}

type DeleteReviewDialogProps = {
  visible: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** The confirmation a delete asks for before the row is removed. */
function DeleteReviewDialog({ visible, deleting, onClose, onConfirm }: DeleteReviewDialogProps) {
  return (
    <Modal
      actions={
        <>
          <GhostButton label={t('common.cancel')} onPress={onClose} />
          <DangerButton label={t('reviews.deleteConfirm')} loading={deleting} onPress={onConfirm} />
        </>
      }
      description={t('reviews.deleteDescription')}
      onClose={onClose}
      title={t('reviews.deleteTitle')}
      visible={visible}
    />
  );
}

/** Everyone else's reviews, newest first, as plain cards. */
function OtherReviewList({ reviews }: { reviews: readonly SpotReview[] }) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <View className="gap-list-gap">
      {reviews.map((review) => (
        <ReviewCard
          authorName={review.authorName}
          dateLabel={formatMonthDayYear(review.date)}
          key={review.id}
          rating={review.rating}
          text={review.text}
        />
      ))}
    </View>
  );
}

/**
 * The reviews section: the athlete's own review first, then everyone else's, with the one action
 * that writes or edits it.
 *
 * The athlete's review is deliberately separated from the rest rather than left to read as one
 * voice among many: it is the only one they can change, and the spot page has to make their own
 * rating tellable apart from the spot's average.
 */
export function SpotReviewsSection({
  spot,
  reviews,
  ownReview,
  onSaveReview,
  onDeleteReview,
  saving,
  deleting,
  loading,
  error,
  onRetry,
}: SpotReviewsProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  // Bumped on every open, so the sheet remounts and starts from the stored review rather than
  // from whatever was typed and then cancelled last time.
  const [sheetSession, setSheetSession] = useState(0);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);

  const { requireAuth, signedIn } = useRequireAuth();

  const otherReviews = reviews.filter((review) => review.id !== ownReview?.id);

  const openSheet = useCallback(() => {
    // A guest can read every review on the page, so the button stays — but the write behind it is
    // theirs, and it has to be asked for before the sheet opens. Redirecting first means the sheet
    // is never on screen for an athlete who cannot use it, and signing in returns them to the
    // spot they were reading.
    requireAuth(() => {
      setSubmitError(undefined);
      setSheetSession((session) => session + 1);
      setSheetVisible(true);
    });
  }, [requireAuth]);

  const handleSubmit = useCallback(
    async (rating: number, text: string) => {
      setSubmitError(undefined);

      try {
        await onSaveReview(rating, text);
        setSheetVisible(false);
      } catch {
        // The list was rolled back by the hook; the sheet stays open so the draft is not lost.
        setSubmitError(t('reviews.saveFailed'));
      }
    },
    [onSaveReview],
  );

  const handleDelete = useCallback(async () => {
    setDeleteError(undefined);

    try {
      await onDeleteReview();
      setDeleteVisible(false);
    } catch {
      setDeleteVisible(false);
      setDeleteError(t('reviews.deleteFailed'));
    }
  }, [onDeleteReview]);

  return (
    <View className="mt-space-32 gap-space-16">
      <SectionHeader accent title={t('reviews.title')} />

      {loading ? (
        <Text className="text-bodySmall text-text-secondary">{t('common.loading')}</Text>
      ) : error ? (
        <View className="gap-space-12">
          <Text className="text-bodySmall text-text-secondary">{t('common.errorDescription')}</Text>
          <SecondaryButton fullWidth label={t('common.tryAgain')} onPress={onRetry} />
        </View>
      ) : reviews.length === 0 ? (
        <Text className="text-bodySmall text-text-secondary">{t('reviews.empty')}</Text>
      ) : null}

      <SecondaryButton
        fullWidth
        label={
          signedIn
            ? ownReview === undefined
              ? t('reviews.write')
              : t('reviews.edit')
            : t('reviews.writeSignedIn')
        }
        leftIcon={
          <Ionicons
            color={brandColors.primary}
            name={ownReview === undefined ? 'star-outline' : 'create-outline'}
            size={iconSizeValues.sm}
          />
        }
        onPress={openSheet}
      />

      {ownReview === undefined ? null : (
        <OwnReviewBlock
          deleting={deleting}
          errorText={deleteError}
          onDeletePress={() => {
            setDeleteError(undefined);
            setDeleteVisible(true);
          }}
          review={ownReview}
        />
      )}

      <OtherReviewList reviews={otherReviews} />

      <AddReviewSheet
        errorText={submitError}
        existing={ownReview}
        key={sheetSession}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSubmit}
        saving={saving}
        spotName={spot.name}
        visible={sheetVisible}
      />

      <DeleteReviewDialog
        deleting={deleting}
        onClose={() => setDeleteVisible(false)}
        onConfirm={() => void handleDelete()}
        visible={deleteVisible}
      />
    </View>
  );
}
