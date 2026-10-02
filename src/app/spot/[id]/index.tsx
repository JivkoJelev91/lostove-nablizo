import { Linking, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ConditionBadge,
  EquipmentList,
  FavoriteButton,
  GhostButton,
  IconButton,
  ImageCarousel,
  PrimaryButton,
  Rating,
  Screen,
  SectionHeader,
  VerificationBadge,
} from '@/components';
import type { EquipmentListItem } from '@/components';
import { brandColors, iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { useFavorites } from '@/features/favorites/useFavorites';
import { SpotReviewsSection } from '@/features/reviews/SpotReviewsSection';
import { useSpotReviewsQuery } from '@/features/reviews/useReviewsQuery';
import { EQUIPMENT_ICONS, isEquipmentName } from '@/features/spots/equipment-icons';
import { spotDirectionsUrl } from '@/features/spots/spot-links';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import { SpotStatusNotice } from '@/features/spots/SpotStatusNotice';
import type { Spot } from '@/features/spots/types';
import { useSpotQuery } from '@/features/spots/useSpotsQuery';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

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

/** The header row: back, and the edit action for whoever is allowed to press it. */
function SpotHeader({ spot, canEdit }: { spot: Spot; canEdit: boolean }) {
  const scheme = useScheme();

  return (
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
  );
}

/**
 * One spot: its photos, name, rating, equipment, condition, description and reviews.
 *
 * Everything on this page is one row and its relations, so it is a single query rather than four
 * that could each fail on their own. The three states are kept apart: not-found is a settled
 * answer for a spot that does not exist or that the reader may not see, an error is a real
 * failure with a retry, and loading says so rather than showing a page of zeroes.
 */
export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spotId = typeof id === 'string' ? id : null;

  const { data: spot, isLoading, isError, refetch } = useSpotQuery(spotId);
  const reviews = useSpotReviewsQuery(spotId);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { user } = useCurrentUser();

  if (isLoading) {
    return (
      <Screen edges={['top', 'bottom']} padded={false} scroll>
        <Text className="p-space-24 text-body text-text-secondary">{t('common.loading')}</Text>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen edges={['top', 'bottom']} padded={false} scroll>
        <View className="gap-space-12 p-space-24">
          <Text className="text-body text-text-primary">{t('common.errorTitle')}</Text>
          <Text className="text-bodySmall text-text-secondary">{t('common.errorDescription')}</Text>
          <GhostButton label={t('common.tryAgain')} onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  if (spot === null || spot === undefined) {
    return <SpotNotFound />;
  }

  const isOwner = spot.ownerId !== undefined && spot.ownerId === user?.id;

  // A spot that is not approved is only visible to the athlete who submitted it; everyone
  // else gets the same answer as for a removed spot.
  if (spot.status !== 'approved' && !isOwner) {
    return <SpotNotFound />;
  }

  const saved = isFavorite(spot.id);
  const canEdit = isOwner && spot.status !== 'closed';
  // A spot still waiting for its first review has no rating to state.
  const hasRating = spot.reviewCount > 0;

  return (
    <Screen
      contentContainerClassName="pb-section-gap-lg"
      edges={['top', 'bottom']}
      padded={false}
      scroll
    >
      <SpotHeader canEdit={canEdit} spot={spot} />

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

          {hasRating ? (
            <Rating count={spot.reviewCount} value={spot.rating} variant="summary" />
          ) : null}

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
            onPress={() => {
              void Linking.openURL(spotDirectionsUrl(spot));
            }}
          />
        </View>

        {/* Reviews belong to a spot the public can see; while one waits for approval there is
            nobody to read them, so the page ends at the description and navigation instead. */}
        {spot.status === 'approved' ? (
          <SpotReviewsSection
            error={reviews.isError}
            loading={reviews.isLoading}
            onRetry={() => void reviews.refetch()}
            onSaveReview={reviews.writeReview}
            ownReview={reviews.ownReview}
            reviews={reviews.reviews}
            spot={spot}
          />
        ) : null}
      </View>
    </Screen>
  );
}
