import { useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, Share, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Href } from 'expo-router';

import { GhostButton, IconButton, ScreenShell, SectionHeader } from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { ProfileReviewCard } from '@/features/profile/ProfileReviewCard';
import { ProfileSpotCard } from '@/features/profile/ProfileSpotCard';
import { ProfileStats } from '@/features/profile/ProfileStats';
import { useProfile } from '@/features/profile/useProfile';
import type { Spot, SpotReview } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

/** How many of each contribution the profile previews before it points at the full list. */
const SPOT_PREVIEW_LIMIT = 3;
const REVIEW_PREVIEW_LIMIT = 2;

type ProfileRow =
  | { kind: 'heading'; key: string; title: string; viewAll?: Href }
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
 *
 * Each section previews a few rows and hands the rest to a dedicated list, so a prolific
 * contributor's profile stays navigable without hiding the fact that more exists.
 */
export default function ProfileScreen() {
  const scheme = useScheme();
  const { displayName, reviews, signedIn, spots, username } = useProfile();
  const { spots: favoriteSpots } = useFavorites();

  const shareProfile = useCallback(() => {
    void Share.share({
      message: t('profile.shareMessage', { name: displayName, username }),
    }).catch(() => {
      // A device with no share sheet has nothing to open; sharing is optional, so it stays quiet.
    });
  }, [displayName, username]);

  const rows = useMemo<ProfileRow[]>(() => {
    const spotPreview = spots.slice(0, SPOT_PREVIEW_LIMIT);
    const reviewPreview = reviews.slice(0, REVIEW_PREVIEW_LIMIT);

    const spotRows: ProfileRow[] =
      spotPreview.length === 0
        ? [{ kind: 'text', key: 'spots-empty', text: t('profile.spotsEmpty') }]
        : spotPreview.map((spot) => ({ kind: 'spot', key: spot.id, spot }));

    const reviewRows: ProfileRow[] =
      reviewPreview.length === 0
        ? [{ kind: 'text', key: 'reviews-empty', text: t('profile.reviewsEmpty') }]
        : reviewPreview.map((review) => ({ kind: 'review', key: review.id, review }));

    return [
      {
        kind: 'heading',
        key: 'spots-heading',
        title: t('profile.yourSpots'),
        viewAll: spots.length > SPOT_PREVIEW_LIMIT ? '/profile/spots' : undefined,
      },
      ...spotRows,
      {
        kind: 'heading',
        key: 'reviews-heading',
        title: t('profile.yourReviews'),
        viewAll: reviews.length > REVIEW_PREVIEW_LIMIT ? '/profile/reviews' : undefined,
      },
      ...reviewRows,
    ];
  }, [reviews, spots]);

  const openSpot = useCallback((spot: Spot) => {
    router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
  }, []);

  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<ProfileRow>) => {
      if (item.kind === 'heading') {
        const viewAll = item.viewAll;

        // 12 here plus the list's own 12 gap is the 24 the sections sit apart.
        return (
          <SectionHeader
            accent
            action={
              viewAll === undefined ? undefined : (
                <GhostButton
                  label={t('common.viewAll')}
                  onPress={() => router.push(viewAll)}
                  size="sm"
                />
              )
            }
            className="mt-space-12"
            title={item.title}
          />
        );
      }

      if (item.kind === 'text') {
        return <Text className="text-bodySmall text-text-secondary">{item.text}</Text>;
      }

      if (item.kind === 'spot') {
        return <ProfileSpotCard onPress={() => openSpot(item.spot)} spot={item.spot} />;
      }

      return <ProfileReviewCard review={item.review} />;
    },
    [openSpot],
  );

  return (
    <ScreenShell
      action={
        <IconButton
          accessibilityLabel={t('settings.title')}
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
      description={t('profile.description')}
      title={t('profile.title')}
      variant="tab"
    >
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-list-gap pb-section-gap-lg"
        data={rows}
        keyExtractor={(row) => row.key}
        ListHeaderComponent={
          <View className="gap-section-gap">
            <ProfileHeader
              displayName={displayName}
              onShare={shareProfile}
              onSignIn={() => router.push('/auth')}
              signedIn={signedIn}
              username={username}
            />

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
