import { useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, RefreshControl, Share, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Href } from 'expo-router';

import {
  ErrorState,
  GhostButton,
  IconButton,
  LoadingSpinner,
  ScreenShell,
  SectionHeader,
} from '@/components';
import { iconSizeValues, schemeTextMuted, schemeTextPrimary } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { ProfileReviewCard } from '@/features/profile/ProfileReviewCard';
import { ProfileSpotCard } from '@/features/profile/ProfileSpotCard';
import { ProfileStats } from '@/features/profile/ProfileStats';
import { useProfile } from '@/features/profile/useProfile';
import type { OwnReview } from '@/features/reviews/useOwnReviewsQuery';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

/** How many of each contribution the profile previews before it points at the full list. */
const SPOT_PREVIEW_LIMIT = 3;
const REVIEW_PREVIEW_LIMIT = 2;

type ProfileRow =
  | { kind: 'heading'; key: string; title: string; viewAll?: Href }
  | { kind: 'text'; key: string; text: string; action?: { label: string; href: Href } }
  | { kind: 'spot'; key: string; spot: Spot }
  | { kind: 'review'; key: string; review: OwnReview };

type ProfileRowItemProps = {
  item: ProfileRow;
  onOpenSpot: (spot: Spot) => void;
};

/** One row of the profile: a section heading, an empty note, a spot or a review. */
function ProfileRowItem({ item, onOpenSpot }: ProfileRowItemProps) {
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
    const action = item.action;

    return (
      <View className="gap-space-12">
        <Text className="text-bodySmall text-text-secondary">{item.text}</Text>
        {action === undefined ? null : (
          <GhostButton
            className="self-start"
            label={action.label}
            onPress={() => router.push(action.href)}
          />
        )}
      </View>
    );
  }

  if (item.kind === 'spot') {
    return <ProfileSpotCard onPress={() => onOpenSpot(item.spot)} spot={item.spot} />;
  }

  return <ProfileReviewCard review={item.review} />;
}

type ProfileFeedProps = {
  displayName: string;
  error: boolean;
  favoriteCount: number;
  loading: boolean;
  reviews: readonly OwnReview[];
  refreshing: boolean;
  signedIn: boolean;
  spots: readonly Spot[];
  username: string;
  onRefetch: () => void;
  onShare: () => void;
  onSignIn: () => void;
};

/** The contribution list with its header, stats and pull-to-refresh, apart from the screen's data. */
function ProfileFeed({
  displayName,
  error,
  favoriteCount,
  loading,
  reviews,
  refreshing,
  signedIn,
  spots,
  username,
  onRefetch,
  onShare,
  onSignIn,
}: ProfileFeedProps) {
  const scheme = useScheme();

  const openSpot = useCallback((spot: Spot) => {
    router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
  }, []);

  const rows = useMemo<ProfileRow[]>(() => {
    // While the lists are loading or failed they are not empty, they are unknown; the headings
    // and their "nothing here yet" copy belong to a settled answer only.
    if (loading || error) return [];

    const spotPreview = spots.slice(0, SPOT_PREVIEW_LIMIT);
    const reviewPreview = reviews.slice(0, REVIEW_PREVIEW_LIMIT);

    const spotRows: ProfileRow[] =
      spotPreview.length === 0
        ? [
            {
              action: { href: '/(tabs)/add', label: t('nav.addSpotLabel') },
              key: 'spots-empty',
              kind: 'text',
              text: t('profile.spotsEmpty'),
            },
          ]
        : spotPreview.map((spot) => ({ kind: 'spot', key: spot.id, spot }));

    const reviewRows: ProfileRow[] =
      reviewPreview.length === 0
        ? [
            {
              action: { href: '/', label: t('profile.allReviewsFindSpot') },
              key: 'reviews-empty',
              kind: 'text',
              text: t('profile.reviewsEmpty'),
            },
          ]
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
  }, [error, loading, reviews, spots]);

  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<ProfileRow>) => (
      <ProfileRowItem item={item} onOpenSpot={openSpot} />
    ),
    [openSpot],
  );

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="gap-list-gap pb-section-gap-lg"
      data={rows}
      keyExtractor={(row) => row.key}
      ListHeaderComponent={
        <View className="gap-section-gap">
          <ProfileHeader
            displayName={displayName}
            onShare={onShare}
            onSignIn={onSignIn}
            signedIn={signedIn}
            username={username}
          />

          {loading ? (
            <LoadingSpinner className="py-section-gap" />
          ) : error ? (
            <ErrorState onRetry={onRefetch} />
          ) : (
            <ProfileStats favorites={favoriteCount} reviews={reviews.length} spots={spots.length} />
          )}
        </View>
      }
      refreshControl={
        <RefreshControl
          onRefresh={onRefetch}
          refreshing={refreshing}
          tintColor={schemeTextMuted[scheme]}
        />
      }
      renderItem={renderRow}
    />
  );
}

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
  const { displayName, error, loading, refetch, refreshing, reviews, signedIn, spots, username } =
    useProfile();
  const { spots: favoriteSpots } = useFavorites();

  const shareProfile = useCallback(() => {
    void Share.share({
      message: t('profile.shareMessage', { name: displayName, username }),
    }).catch(() => {
      // A device with no share sheet has nothing to open; sharing is optional, so it stays quiet.
    });
  }, [displayName, username]);

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
      <ProfileFeed
        displayName={displayName}
        error={error}
        favoriteCount={favoriteSpots.length}
        loading={loading}
        onRefetch={() => void refetch()}
        onShare={shareProfile}
        onSignIn={() => router.push('/auth')}
        refreshing={refreshing}
        reviews={reviews}
        signedIn={signedIn}
        spots={spots}
        username={username}
      />
    </ScreenShell>
  );
}
