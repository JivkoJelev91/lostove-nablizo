import { useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ConditionBadge,
  EmptyState,
  EquipmentList,
  GhostButton,
  IconButton,
  PrimaryButton,
  Rating,
  ReviewCard,
  Screen,
  ScreenShell,
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
import { EQUIPMENT_ICONS, isEquipmentName } from '@/features/spots/equipment-icons';
import { MOCK_REVIEWS } from '@/features/spots/mock-reviews';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import { spotDirectionsUrl } from '@/features/spots/spot-links';
import type { Spot, SpotReview } from '@/features/spots/types';
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

function SpotNotFound() {
  return (
    <ScreenShell padded={false} title="Spot not found" variant="stack">
      <EmptyState
        action={<GhostButton label="Back to spots" onPress={() => router.replace('/')} />}
        description="The spot you are looking for may have been removed, or the link may be wrong."
        title="Spot not found"
      />
    </ScreenShell>
  );
}

type SpotReviewsProps = {
  rating: number;
  reviews: readonly SpotReview[];
};

function SpotReviews({ rating, reviews }: SpotReviewsProps) {
  return (
    <View className="mt-space-32 gap-space-16">
      <SectionHeader accent title="Reviews" />

      {reviews.length === 0 ? (
        <Text className="text-bodySmall text-text-secondary">
          No reviews yet. Be the first to train here and leave one.
        </Text>
      ) : (
        <>
          <Rating size="lg" value={rating} />

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
        </>
      )}
    </View>
  );
}

export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const scheme = useScheme();

  const spot = MOCK_SPOTS.find((candidate) => candidate.id === id);

  if (spot === undefined) {
    return <SpotNotFound />;
  }

  const reviews = MOCK_REVIEWS.filter((review) => review.spotId === spot.id);

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
      <View className="p-space-12">
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
      </View>

      <Image
        accessibilityLabel={spot.name}
        className="h-spot-hero w-full bg-bg-surface"
        source={spot.image}
      />

      <View className="px-screen-px pt-space-16">
        <View className="gap-space-8">
          <View className="flex-row items-center justify-between gap-space-12">
            <Text className="flex-1 font-bold text-h1 text-text-primary">{spot.name}</Text>

            <IconButton
              accessibilityLabel={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              icon={
                <Ionicons
                  color={isFavorite ? statusColors.bad : schemeTextSecondary[scheme]}
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={iconSizeValues.sm}
                />
              }
              onPress={() => setIsFavorite((value) => !value)}
              variant="surface"
            />
          </View>

          <Rating count={spot.reviewCount} value={spot.rating} variant="summary" />

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

        <SpotReviews rating={spot.rating} reviews={reviews} />
      </View>
    </Screen>
  );
}
