import { useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Avatar,
  Card,
  GhostButton,
  IconButton,
  ReviewCard,
  ScreenShell,
  SectionHeader,
  SpotCard,
} from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { ProfileStats } from '@/features/profile/ProfileStats';
import { useProfile } from '@/features/profile/useProfile';
import { coverImage } from '@/features/spots/spot-photos';
import type { Spot, SpotReview } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { formatMonthDayYear } from '@/utils/dates';

type ProfileRow =
  | { kind: 'heading'; key: string; title: string }
  | { kind: 'text'; key: string; text: string }
  | { kind: 'spot'; key: string; spot: Spot }
  | { kind: 'review'; key: string; review: SpotReview };

/**
 * What this athlete has contributed to the directory: the spots they added, the reviews they
 * wrote and the places they saved.
 *
 * Deliberately not a feed. There is no stream of other people's activity here, because a spot
 * directory earns its value from what the athlete has added to it, and a social timeline would
 * bury that under content the athlete did not create.
 */
export default function ProfileScreen() {
  const scheme = useScheme();
  const { displayName, reviews, spots, username } = useProfile();
  const { spots: favoriteSpots } = useFavorites();

  const rows = useMemo<ProfileRow[]>(() => {
    const spotRows: ProfileRow[] =
      spots.length === 0
        ? [{ kind: 'text', key: 'spots-empty', text: 'You have not added a spot yet.' }]
        : spots.map((spot) => ({ kind: 'spot', key: spot.id, spot }));

    const reviewRows: ProfileRow[] =
      reviews.length === 0
        ? [{ kind: 'text', key: 'reviews-empty', text: 'You have not reviewed a spot yet.' }]
        : reviews.map((review) => ({ kind: 'review', key: review.id, review }));

    return [
      { kind: 'heading', key: 'spots-heading', title: 'Your spots' },
      ...spotRows,
      { kind: 'heading', key: 'reviews-heading', title: 'Your reviews' },
      ...reviewRows,
    ];
  }, [reviews, spots]);

  const openSpot = useCallback((spot: Spot) => {
    router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
  }, []);

  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<ProfileRow>) => {
      if (item.kind === 'heading') {
        // 12 here plus the list's own 12 gap is the 24 the sections sit apart.
        return <SectionHeader accent className="mt-space-12" title={item.title} />;
      }

      if (item.kind === 'text') {
        return <Text className="text-bodySmall text-text-secondary">{item.text}</Text>;
      }

      if (item.kind === 'spot') {
        return (
          <SpotCard
            equipment={item.spot.equipment}
            imageUri={coverImage(item.spot)}
            name={item.spot.name}
            onPress={() => openSpot(item.spot)}
            rating={item.spot.rating}
            reviewCount={item.spot.reviewCount}
            variant="compact"
          />
        );
      }

      return (
        <ReviewCard
          dateLabel={formatMonthDayYear(item.review.date)}
          rating={item.review.rating}
          text={item.review.text}
        />
      );
    },
    [openSpot],
  );

  return (
    <ScreenShell
      action={
        <IconButton
          accessibilityLabel="Settings"
          icon={
            <Ionicons
              color={schemeTextPrimary[scheme]}
              name="settings-outline"
              size={iconSizeValues.md}
            />
          }
          onPress={() => router.push('/settings')}
          variant="surface"
        />
      }
      description="Your spots, reviews and saved places"
      title="Profile"
      variant="tab"
    >
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-list-gap pb-section-gap-lg"
        data={rows}
        keyExtractor={(row) => row.key}
        ListHeaderComponent={
          <View className="gap-section-gap">
            <Card gap="md">
              <View className="flex-row items-center gap-space-12">
                <Avatar name={displayName} size="lg" />

                <View className="flex-1 gap-space-2">
                  <Text className="font-semibold text-h2 text-text-primary">{displayName}</Text>
                  <Text className="text-bodySmall text-text-secondary">{`@${username}`}</Text>
                </View>
              </View>

              {/* The identity above is the mock athlete. Until Clerk owns the session there is
                  no real one, so the button stays as the way into the auth screens. */}
              <GhostButton label="Sign in" onPress={() => router.push('/auth/sign-in')} />
            </Card>

            <ProfileStats
              favorites={favoriteSpots.length}
              reviews={reviews.length}
              spots={spots.length}
            />
          </View>
        }
        renderItem={renderRow}
      />
    </ScreenShell>
  );
}
