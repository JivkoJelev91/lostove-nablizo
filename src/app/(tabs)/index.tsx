import { useCallback, useMemo, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';

import { router } from 'expo-router';

import { ScreenShell } from '@/components';
import { useFavorites } from '@/features/favorites/useFavorites';
import { useUserLocation } from '@/features/location/useUserLocation';
import { FeedList } from '@/features/spots/FeedList';
import { FeedSpotCard } from '@/features/spots/FeedSpotCard';
import { byDistance } from '@/features/spots/spot-distance';
import { SpotFilterSheet } from '@/features/spots/SpotFilterSheet';
import { SpotSearchSheet } from '@/features/spots/SpotSearchSheet';
import type { Spot } from '@/features/spots/types';
import { filterSpots, useSpotFilters } from '@/features/spots/useSpotFilters';
import { useFeedSpotsQuery, useSearchSpotsQuery } from '@/features/spots/useSpotsQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/** How long typing must pause before a search is sent, so each keystroke is not its own request. */
const SEARCH_DEBOUNCE_MS = 300;

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
    isFetching,
    refetch,
    nearby: measured,
  } = useFeedSpotsQuery(location);
  const approvedSpots = useMemo(() => spots.filter((spot) => spot.status === 'approved'), [spots]);
  const { activeCount, apply, clear, filtered, filters, toggle } = useSpotFilters(approvedSpots);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  // Bumped on every open, so the sheet's draft starts from the filters actually in force.
  const [filterSession, setFilterSession] = useState(0);
  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const search = useSearchSpotsQuery(debouncedSearch);

  // The filters narrow the search results with the same rules they narrow the feed.
  const searchResults = useMemo(
    () => filterSpots(search.data ?? [], filters),
    [filters, search.data],
  );

  // The rows arrive nearest-first from the function. The sort is what orders the fallback list,
  // where no position means no distances, and it keeps a spot without one at the end rather than
  // at the top. On the nearby list it is a no-op.
  const sortedSpots = useMemo(() => [...filtered].sort(byDistance), [filtered]);

  const openFilters = useCallback(() => {
    setFilterSession((session) => session + 1);
    setFilterVisible(true);
  }, []);

  const openSearch = useCallback(() => setSearchVisible(true), []);

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
      <FeedSpotCard
        isFavorite={isFavorite(item.id)}
        onOpen={openSpot}
        onToggleFavorite={toggleFavorite}
        spot={item}
      />
    ),
    [isFavorite, openSpot, toggleFavorite],
  );

  return (
    <>
      <ScreenShell header={false} padded={false} variant="tab">
        <FeedList
          activeCount={activeCount}
          isError={isError}
          isFetching={isFetching}
          isLoading={isLoading}
          location={location}
          measured={measured}
          onAddSpot={() => router.navigate('/(tabs)/add')}
          onClearFilters={clear}
          onOpenFilters={openFilters}
          onOpenSearch={openSearch}
          onRefresh={() => void refetch()}
          onRetry={refetch}
          onToggleEquipment={toggle}
          renderSpot={renderSpot}
          selectedEquipment={filters.equipment}
          spots={sortedSpots}
        />
      </ScreenShell>

      <SpotSearchSheet
        browseSpots={sortedSpots}
        onChangeQuery={setSearchQuery}
        onClose={closeSearch}
        onRetry={() => void search.refetch()}
        onSelect={openSpot}
        query={searchQuery}
        results={searchResults}
        searchError={search.isError}
        searching={search.isFetching}
        visible={searchVisible}
      />

      <SpotFilterSheet
        filters={filters}
        hasDistance={measured}
        key={filterSession}
        onApply={(next) => {
          apply(next);
          setFilterVisible(false);
        }}
        onClose={() => setFilterVisible(false)}
        spots={approvedSpots}
        visible={filterVisible}
      />
    </>
  );
}
