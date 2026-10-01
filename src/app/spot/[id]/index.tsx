import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ConditionBadge,
  EquipmentList,
  IconButton,
  ImageCarousel,
  PrimaryButton,
  Rating,
  ReviewCard,
  Screen,
  SecondaryButton,
  SectionHeader,
  VerificationBadge,
} from '@/components';
import type { EquipmentListItem } from '@/components';
import {
  brandColors,
  iconSizeValues,
  schemeTextPrimary,
  schemeTextSecondary,
  statusColors,
} from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { AddReviewSheet } from '@/features/reviews/AddReviewSheet';
import { useReviews } from '@/features/reviews/useReviews';
import { EQUIPMENT_ICONS, isEquipmentName } from '@/features/spots/equipment-icons';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import { spotDirectionsUrl } from '@/features/spots/spot-links';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { formatMonthDayYear } from '@/utils/dates';

/** Turns a spot's equipment into the tiles the list renders, icons included where one exists. */
function equipmentItemsFor(spot: Spot): EquipmentListItem[] {
  return spot.equipment.map((item) => {
    const Icon = isEquipmentName(item.name) ? EQUIPMENT_ICONS[item.name] : undefined;

    return {
      name: item.name,
      quantity: item.quantity,
      icon:
        Icon === undefined ? undefined : (
          <Icon color={brandColors.primary} size={iconSizeValues.md} />
        ),
    };
  });
}

/**
 * The reviews section: the athlete's own review first, then everyone else's, with the one action
 * that writes or edits it.
 *
 * The athlete's review is deliberately separated from the rest rather than left to read as one
 * voice among many: it is the only one they can change, and the spot page has to make their own
 * rating tellable apart from the spot's average.
 */
function SpotReviews({ spot }: { spot: Spot }) {
  const { otherReviewsFor, ownReviewFor, reviewsFor, saveReview } = useReviews();
  const [sheetVisible, setSheetVisible] = useState(false);
  // Bumped on every open, so the sheet remounts and starts from the stored review rather than
  // from whatever was typed and then cancelled last time.
  const [sheetSession, setSheetSession] = useState(0);

  const ownReview = ownReviewFor(spot.id);
  const otherReviews = otherReviewsFor(spot.id);
  const hasReviews = reviewsFor(spot.id).length > 0;

  const openSheet = () => {
    setSheetSession((session) => session + 1);
    setSheetVisible(true);
  };

  return (
    <View className="mt-space-32 gap-space-16">
      <SectionHeader accent title="Reviews" />

      {hasReviews ? null : (
        <Text className="text-bodySmall text-text-secondary">
          No reviews yet. Be the first to train here and leave one.
        </Text>
      )}

      <SecondaryButton
        fullWidth
        label={ownReview === undefined ? 'Write a review' : 'Edit your review'}
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
        <View className="gap-space-8">
          <Text className="font-semibold text-bodySmall text-text-secondary">Your review</Text>
          <ReviewCard
            authorName={ownReview.authorName}
            dateLabel={formatMonthDayYear(ownReview.date)}
            rating={ownReview.rating}
            text={ownReview.text}
          />
        </View>
      )}

      {otherReviews.length === 0 ? null : (
        <View className="gap-list-gap">
          {otherReviews.map((review) => (
            <ReviewCard
              authorName={review.authorName}
              dateLabel={formatMonthDayYear(review.date)}
              key={review.id}
              rating={review.rating}
              text={review.text}
            />
          ))}
        </View>
      )}

      <AddReviewSheet
        existing={ownReview}
        key={sheetSession}
        onClose={() => setSheetVisible(false)}
        onSubmit={(rating, text) => {
          saveReview(spot.id, rating, text);
          setSheetVisible(false);
        }}
        spotName={spot.name}
        visible={sheetVisible}
      />
    </View>
  );
}

export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { summaryFor } = useReviews();
  const scheme = useScheme();

  const spot = MOCK_SPOTS.find((candidate) => candidate.id === id);

  if (spot === undefined) {
    return <SpotNotFound />;
  }

  const summary = summaryFor(spot);
  const saved = isFavorite(spot.id);

  const openDirections = () => {
    void Linking.openURL(spotDirectionsUrl(spot));
  };

  return (
    <Screen
      contentContainerClassName="pb-section-gap-lg"
      edges={['top', 'bottom']}
      padded={false}
      scroll
    >
      <View className="flex-row items-center justify-between p-space-12">
        <IconButton
          accessibilityLabel="Back"
          icon={
            <Ionicons
              color={schemeTextPrimary[scheme]}
              name="chevron-back"
              size={iconSizeValues.md}
            />
          }
          onPress={() => router.back()}
          variant="surface"
        />

        <IconButton
          accessibilityLabel="Edit spot"
          icon={
            <Ionicons
              color={schemeTextPrimary[scheme]}
              name="create-outline"
              size={iconSizeValues.md}
            />
          }
          onPress={() => router.push({ pathname: '/spot/[id]/edit', params: { id: spot.id } })}
          variant="surface"
        />
      </View>

      <ImageCarousel accessibilityLabel={spot.name} images={spot.images} />

      <View className="px-screen-px pt-space-16">
        <View className="gap-space-8">
          <View className="flex-row items-center justify-between gap-space-12">
            <Text className="flex-1 font-bold text-h1 text-text-primary">{spot.name}</Text>

            <IconButton
              accessibilityLabel={saved ? 'Remove from favorites' : 'Add to favorites'}
              icon={
                <Ionicons
                  color={saved ? statusColors.bad : schemeTextSecondary[scheme]}
                  name={saved ? 'heart' : 'heart-outline'}
                  size={iconSizeValues.sm}
                />
              }
              onPress={() => toggleFavorite(spot.id)}
              variant="surface"
            />
          </View>

          <Rating count={summary.count} value={summary.average} variant="summary" />

          <VerificationBadge verifiedAt={spot.verifiedAt} />
        </View>

        <View className="mt-space-24 gap-space-12">
          <SectionHeader accent title="Equipment" />
          <EquipmentList items={equipmentItemsFor(spot)} />
        </View>

        <View className="mt-space-32">
          <SectionHeader
            accent
            action={<ConditionBadge condition={spot.condition} />}
            title="Condition"
          />
        </View>

        <View className="mt-space-32 gap-space-8">
          <SectionHeader accent title="Description" />
          <Text className="text-body text-text-secondary">{spot.description}</Text>
        </View>

        <View className="mt-space-32">
          <PrimaryButton
            fullWidth
            label="Navigate"
            leftIcon={
              <Ionicons
                color={brandColors.onPrimary}
                name="navigate-outline"
                size={iconSizeValues.sm}
              />
            }
            onPress={openDirections}
          />
        </View>

        <SpotReviews spot={spot} />
      </View>
    </Screen>
  );
}
