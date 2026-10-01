import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import {
  ConditionBadge,
  EquipmentList,
  FavoriteButton,
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
import { brandColors, iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { useFavorites } from '@/features/favorites/useFavorites';
import { AddReviewSheet } from '@/features/reviews/AddReviewSheet';
import { useReviews } from '@/features/reviews/useReviews';
import { EQUIPMENT_ICONS, isEquipmentName } from '@/features/spots/equipment-icons';
import { spotDirectionsUrl } from '@/features/spots/spot-links';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import { SpotStatusNotice } from '@/features/spots/SpotStatusNotice';
import type { Spot } from '@/features/spots/types';
import { useSpots } from '@/features/spots/useSpots';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
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
      <SectionHeader accent title={t('reviews.title')} />

      {hasReviews ? null : (
        <Text className="text-bodySmall text-text-secondary">{t('reviews.empty')}</Text>
      )}

      <SecondaryButton
        fullWidth
        label={ownReview === undefined ? t('reviews.write') : t('reviews.edit')}
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
        <Animated.View
          className="gap-space-8"
          entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
        >
          <Text className="font-semibold text-bodySmall text-text-secondary">
            {t('reviews.yourReview')}
          </Text>
          <ReviewCard
            authorName={ownReview.authorName}
            dateLabel={formatMonthDayYear(ownReview.date)}
            rating={ownReview.rating}
            text={ownReview.text}
          />
        </Animated.View>
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
  const { spotById } = useSpots();
  const { user } = useCurrentUser();
  const scheme = useScheme();

  const spot = spotById(id);
  const isOwner = spot !== undefined && spot.ownerId !== undefined && spot.ownerId === user?.id;

  // A spot that is not approved is only visible to the athlete who submitted it; everyone
  // else gets the same answer as for a removed spot.
  if (spot === undefined || (spot.status !== 'approved' && !isOwner)) {
    return <SpotNotFound />;
  }

  const summary = summaryFor(spot);
  const saved = isFavorite(spot.id);
  const canEdit = isOwner && spot.status !== 'closed';

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
          accessibilityLabel={t('common.back')}
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

        {canEdit ? (
          <IconButton
            accessibilityLabel={t('spot.edit')}
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
        ) : null}
      </View>

      <ImageCarousel accessibilityLabel={spot.name} images={spot.images} />

      <View className="px-screen-px pt-space-16">
        <View className="gap-space-8">
          <View className="flex-row items-center justify-between gap-space-12">
            <Text className="flex-1 font-bold text-h1 text-text-primary">{spot.name}</Text>

            <FavoriteButton
              isFavorite={saved}
              onPress={() => toggleFavorite(spot.id)}
              size="md"
              variant="surface"
            />
          </View>

          {/* A spot still waiting for its first review has no rating to state. */}
          {summary.count === 0 ? null : (
            <Rating count={summary.count} value={summary.average} variant="summary" />
          )}

          {spot.verifiedAt === undefined ? null : (
            <VerificationBadge verifiedAt={spot.verifiedAt} />
          )}
        </View>

        {isOwner && spot.status !== 'approved' ? (
          <SpotStatusNotice className="mt-space-16" status={spot.status} />
        ) : null}

        <View className="mt-space-24 gap-space-12">
          <SectionHeader accent title={t('spot.equipment')} />
          <EquipmentList items={equipmentItemsFor(spot)} />
        </View>

        <View className="mt-space-32">
          <SectionHeader
            accent
            action={<ConditionBadge condition={spot.condition} />}
            title={t('condition.title')}
          />
        </View>

        <View className="mt-space-32 gap-space-8">
          <SectionHeader accent title={t('spot.description')} />
          <Text className="text-body text-text-secondary">{spot.description}</Text>
        </View>

        <View className="mt-space-32">
          <PrimaryButton
            fullWidth
            label={t('spot.navigate')}
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

        {/* Reviews belong to a spot the public can see; while one waits for approval there is
            nobody to read them, so the page ends at the description and navigation instead. */}
        {spot.status === 'approved' ? <SpotReviews spot={spot} /> : null}
      </View>
    </Screen>
  );
}
