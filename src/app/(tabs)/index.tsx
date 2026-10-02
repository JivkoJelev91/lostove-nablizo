import { useCallback, useMemo, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  BrandLogo,
  EmptyState,
  GhostButton,
  ScreenShell,
  SectionHeader,
  SpotCard,
} from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { LocationPrompt } from '@/features/location/LocationPrompt';
import { useUserLocation } from '@/features/location/useUserLocation';
import { EquipmentFilterChips } from '@/features/spots/equipment-filters';
import { formatDistanceAway } from '@/features/spots/format-distance';
import { byDistance } from '@/features/spots/spot-distance';
import { coverImage } from '@/features/spots/spot-photos';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import { SpotSearchSheet } from '@/features/spots/SpotSearchSheet';
import type { Spot } from '@/features/spots/types';
import { useSpotFilters } from '@/features/spots/useSpotFilters';
import { NEARBY_RADIUS_M, useFeedSpotsQuery } from '@/features/spots/useSpotsQuery';
import { t } from '@/i18n';

function SpotCardSeparator() {
  return <View className="h-space-16" />;
}

type FeedEmptyStateProps = {
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  /** Whether the rows were measured from a position, which decides what an empty list means. */
  measured: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
};

/**
 * What the feed shows when it has no rows, and the reason why.
 *
 * The four cases are four different facts: not loaded yet, failed to load, filtered down to
 * nothing, or simply nothing here. Each has its own next step — wait, retry, clear the filters,
 * or look elsewhere — and collapsing them into one message would blame the athlete for a state
 * they did not create.
 */
function FeedEmptyState({
  hasFilters,
  isError,
  isLoading,
  measured,
  onClearFilters,
  onRetry,
}: FeedEmptyStateProps) {
  if (isLoading) {
    return (
      <EmptyState description={t('common.loading')} padded={false} title={t('home.aroundYou')} />
    );
  }

  if (isError) {
    return (
      <EmptyState
        action={<GhostButton label={t('common.tryAgain')} onPress={onRetry} />}
        description={t('common.errorDescription')}
        padded={false}
        title={t('common.errorTitle')}
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        action={<GhostButton label={t('home.clearFilters')} onPress={onClearFilters} />}
        description={t('home.noMatchDescription')}
        padded={false}
        title={t('home.noMatchTitle')}
      />
    );
  }

  // Nothing within the radius is a different fact from nothing in the directory: the first can be
  // answered by looking elsewhere, the second by adding the first spot. Saying "no match" here
  // would blame filters nobody set.
  if (measured) {
    return (
      <EmptyState
        description={t('home.nearbyEmptyDescription', { radius: NEARBY_RADIUS_M / 1000 })}
        padded={false}
        title={t('home.nearbyEmptyTitle')}
      />
    );
  }

  return (
    <EmptyState
      description={t('home.emptyDescription')}
      padded={false}
      title={t('home.emptyTitle')}
    />
  );
}

/**
 * The app's home feed: the spots nearest to the athlete, discovered through photos.
 *
 * It sits on the first tab, which lists spots by distance rather than on a map. The nearest-first
 * order and the distances themselves come from the database's `nearby_spots` function when a
 * position is known, so the work of finding them is a spatial query on an index rather than a
 * download of every spot followed by a sort on the phone. Without a position the feed falls back
 * to the full directory, which is what a guest sees.
 */
export default function HomeScreen() {
  const location = useUserLocation();
  const {
    data: spots = [],
    isLoading,
    isError,
    refetch,
    nearby: measured,
  } = useFeedSpotsQuery(location);
  const approvedSpots = useMemo(() => spots.filter((spot) => spot.status === 'approved'), [spots]);
  const { selectedNames, toggle, clear, filtered } = useSpotFilters(approvedSpots);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // The rows arrive nearest-first from the function. The sort is what orders the fallback list,
  // where no position means no distances, and it keeps a spot without one at the end rather than
  // at the top. On the nearby list it is a no-op.
  const sortedSpots = useMemo(() => [...filtered].sort(byDistance), [filtered]);

  const closeSearch = useCallback(() => {
    setSearchVisible(false);
    setSearchQuery('');
  }, []);

  const openSpot = useCallback(
    (spot: Spot) => {
      closeSearch();
      router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
    },
    [closeSearch],
  );

  const renderSpot = useCallback(
    ({ item }: ListRenderItemInfo<Spot>) => (
      <View className="px-screen-px">
        <SpotCard
          distanceLabel={formatDistanceAway(item.distanceMeters)}
          equipment={item.equipment}
          imageUri={coverImage(item)}
          isFavorite={isFavorite(item.id)}
          name={item.name}
          onPress={() => openSpot(item)}
          onToggleFavorite={() => toggleFavorite(item)}
          rating={item.rating}
          reviewCount={item.reviewCount}
          variant="list"
          verifiedAt={item.verifiedAt}
        />
      </View>
    ),
    [isFavorite, openSpot, toggleFavorite],
  );

  const renderEmpty = useCallback(
    () => (
      <View className="px-screen-px">
        <FeedEmptyState
          hasFilters={selectedNames.length > 0}
          isError={isError}
          isLoading={isLoading}
          measured={measured}
          onClearFilters={clear}
          onRetry={refetch}
        />
      </View>
    ),
    [clear, isError, isLoading, measured, refetch, selectedNames.length],
  );

  return (
    <>
      <ScreenShell header={false} padded={false} variant="tab">
        <FlatList
          className="flex-1"
          contentContainerClassName="pb-section-gap-lg"
          data={sortedSpots}
          initialNumToRender={4}
          ItemSeparatorComponent={SpotCardSeparator}
          keyExtractor={(spot) => spot.id}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={
            <View className="gap-space-12 pb-space-12">
              <View className="px-screen-px">
                <BrandLogo />
              </View>
              <View className="gap-space-12">
                <View className="px-screen-px">
                  <SpotsSearchBar onPress={() => setSearchVisible(true)} />
                </View>
                <EquipmentFilterChips onToggle={toggle} selectedNames={selectedNames} />
              </View>
              <View className="px-screen-px">
                <LocationPrompt location={location} />
              </View>
              <View className="px-screen-px">
                <SectionHeader
                  action={
                    <View accessible accessibilityLabel={t('home.sortedByDistance')}>
                      <Ionicons
                        color={brandColors.primary}
                        name="location"
                        size={iconSizeValues.md}
                      />
                    </View>
                  }
                  title={t('home.aroundYou')}
                  titleSize="h1"
                />
              </View>
            </View>
          }
          renderItem={renderSpot}
        />
      </ScreenShell>

      <SpotSearchSheet
        onChangeQuery={setSearchQuery}
        onClose={closeSearch}
        onSelect={openSpot}
        query={searchQuery}
        spots={sortedSpots}
        visible={searchVisible}
      />
    </>
  );
}
