import { useState } from 'react';
import { Text, View } from 'react-native';

import { BottomSheet, PrimaryButton, RatingInput, TextArea } from '@/components';
import { REVIEW_TEXT_MAX_LENGTH } from '@/features/reviews/review-schema';
import type { SpotReview } from '@/features/spots/types';
import { t } from '@/i18n';

export type AddReviewSheetProps = {
  visible: boolean;
  spotName: string;
  /** This athlete's stored review, when the sheet is editing rather than writing a first one. */
  existing?: SpotReview;
  /** True while the write is in flight, so the sheet cannot be submitted twice. */
  saving?: boolean;
  /** The message to show when the last write failed; the sheet stays open on it. */
  errorText?: string;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
};

/**
 * The sheet that writes or edits the signed-in athlete's review.
 *
 * One review per athlete per spot is a database rule, so this is deliberately an upsert form:
 * when a review by this athlete already exists the sheet opens on it and saves over it rather
 * than adding a second. The rating is required, the comment is not.
 *
 * The draft lives here from the moment the sheet mounts, so the caller remounts it (via `key`)
 * each time it opens — that way a cancelled draft never survives into the next opening, without
 * syncing state through an effect.
 */
export function AddReviewSheet({
  visible,
  spotName,
  existing,
  saving = false,
  errorText,
  onClose,
  onSubmit,
}: AddReviewSheetProps) {
  const editing = existing !== undefined;
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? '');

  return (
    <BottomSheet
      dismissible={!saving}
      footer={
        <View className="gap-card-gap">
          {errorText === undefined ? null : (
            <Text className="font-medium text-caption text-status-bad">{errorText}</Text>
          )}

          <PrimaryButton
            disabled={rating === 0 || saving}
            fullWidth
            label={editing ? t('reviews.save') : t('reviews.post')}
            loading={saving}
            onPress={() => onSubmit(rating, text.trim())}
          />
        </View>
      }
      onClose={onClose}
      title={editing ? t('reviews.sheetEditTitle') : t('reviews.sheetWriteTitle')}
      visible={visible}
    >
      <View className="gap-space-8">
        <Text className="font-regular text-bodySmall text-text-secondary">{spotName}</Text>
        <Text className="font-medium text-body text-text-primary">{t('reviews.yourRating')}</Text>
        <RatingInput onChange={setRating} value={rating} />

        {rating === 0 ? (
          <Text className="font-medium text-caption text-text-muted">{t('reviews.tapStar')}</Text>
        ) : null}
      </View>

      <TextArea
        label={t('reviews.textLabel')}
        maxLength={REVIEW_TEXT_MAX_LENGTH}
        onChangeText={setText}
        placeholder={t('reviews.textPlaceholder')}
        value={text}
      />
    </BottomSheet>
  );
}
