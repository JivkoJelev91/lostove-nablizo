import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

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
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { formatMonthDayYear } from '@/utils/dates';

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

  const openSpot = (spot: Spot) => {
    router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
  };

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
      scroll
      title="Profile"
      variant="tab"
    >
      <Card gap="md">
        <View className="flex-row items-center gap-space-12">
          <Avatar name={displayName} size="lg" />

          <View className="flex-1 gap-space-2">
            <Text className="font-semibold text-h2 text-text-primary">{displayName}</Text>
            <Text className="text-bodySmall text-text-secondary">{`@${username}`}</Text>
          </View>
        </View>

        {/* The identity above is the mock athlete. Until Clerk owns the session there is no real
            one, so the button stays as the way into the auth screens. */}
        <GhostButton label="Sign in" onPress={() => router.push('/auth/sign-in')} />
      </Card>

      <ProfileStats
        favorites={favoriteSpots.length}
        reviews={reviews.length}
        spots={spots.length}
      />

      <View className="gap-space-12">
        <SectionHeader accent title="Your spots" />

        {spots.length === 0 ? (
          <Text className="text-bodySmall text-text-secondary">You have not added a spot yet.</Text>
        ) : (
          <View className="gap-list-gap">
            {spots.map((spot) => (
              <SpotCard
                equipment={spot.equipment}
                imageUri={spot.image}
                key={spot.id}
                name={spot.name}
                onPress={() => openSpot(spot)}
                rating={spot.rating}
                reviewCount={spot.reviewCount}
                variant="compact"
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-space-12">
        <SectionHeader accent title="Your reviews" />

        {reviews.length === 0 ? (
          <Text className="text-bodySmall text-text-secondary">
            You have not reviewed a spot yet.
          </Text>
        ) : (
          <View className="gap-list-gap">
            {reviews.map((review) => (
              <ReviewCard
                dateLabel={formatMonthDayYear(review.date)}
                key={review.id}
                rating={review.rating}
                text={review.text}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}
