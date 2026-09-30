import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import MapView from 'react-native-maps';

import { router } from 'expo-router';

import { ScreenShell, SpotCard } from '@/components';
import { FilterSheet } from '@/features/map/FilterSheet';
import { LocateButton } from '@/features/map/LocateButton';
import { INITIAL_REGION, MOCK_USER_LOCATION } from '@/features/map/map-region';
import { MapFilterBar } from '@/features/map/MapFilterBar';
import { SpotMarker } from '@/features/map/SpotMarker';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import { SpotSearchSheet } from '@/features/spots/SpotSearchSheet';
import type { Spot } from '@/features/spots/types';
import { useSpotFilters } from '@/features/spots/useSpotFilters';

/** The map is a native view, so it takes a style object rather than a className. */
const MAP_STYLE = { flex: 1 } as const;

/** Keeps the Google logo and compass clear of the floating controls at the bottom. */
const MAP_PADDING = { top: 16, right: 16, bottom: 232, left: 16 };

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { selectedNames, toggle, clear, filtered } = useSpotFilters(MOCK_SPOTS);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [favouriteIds, setFavouriteIds] = useState<readonly string[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  // TEMPORARY diagnostic: distinguishes "map never initialised" from "map ready but tiles blocked".
  const [mapLoaded, setMapLoaded] = useState(false);

  const selectedSpot = filtered.find((spot) => spot.id === selectedSpotId) ?? null;

  const focusSpot = useCallback((spot: Spot) => {
    setSelectedSpotId(spot.id);
    mapRef.current?.animateCamera({ center: spot.coordinate }, { duration: 300 });
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    setFavouriteIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  }, []);

  const closeSearch = useCallback(() => {
    setSearchVisible(false);
    setSearchQuery('');
  }, []);

  const handleSearchSelect = useCallback(
    (spot: Spot) => {
      closeSearch();
      focusSpot(spot);
    },
    [closeSearch, focusSpot],
  );

  return (
    <ScreenShell header={false} padded={false} variant="tab">
      <View className="gap-space-12">
        <View className="px-screen-px">
          <SpotsSearchBar onPress={() => setSearchVisible(true)} />
        </View>

        <MapFilterBar
          onOpenFilters={() => setFiltersVisible(true)}
          onToggle={toggle}
          selectedNames={selectedNames}
        />
      </View>

      <View className="flex-1">
        <MapView
          ref={mapRef}
          initialRegion={INITIAL_REGION}
          mapPadding={MAP_PADDING}
          onMapLoaded={() => setMapLoaded(true)}
          onPress={() => setSelectedSpotId(null)}
          showsMyLocationButton={false}
          style={MAP_STYLE}
          toolbarEnabled={false}
        >
          {filtered.map((spot) => (
            <SpotMarker
              key={spot.id}
              onPress={() => focusSpot(spot)}
              selected={spot.id === selectedSpotId}
              spot={spot}
            />
          ))}
        </MapView>

        {__DEV__ ? (
          <View className="absolute left-space-16 top-space-16 rounded-md bg-bg-surface px-space-8 py-space-4">
            <Text className="text-caption text-text-primary">
              {mapLoaded ? 'MAP READY' : 'MAP NOT LOADING'}
            </Text>
          </View>
        ) : null}

        <View
          className="absolute inset-x-space-16 bottom-space-16 gap-space-12"
          pointerEvents="box-none"
        >
          <View className="items-end">
            <LocateButton
              onPress={() =>
                mapRef.current?.animateCamera({ center: MOCK_USER_LOCATION }, { duration: 400 })
              }
            />
          </View>

          {selectedSpot === null ? null : (
            <SpotCard
              className="shadow-card-elevated"
              equipment={selectedSpot.equipment}
              isFavorite={favouriteIds.includes(selectedSpot.id)}
              name={selectedSpot.name}
              onPress={() =>
                router.push({ pathname: '/spot/[id]', params: { id: selectedSpot.id } })
              }
              onToggleFavorite={() => toggleFavourite(selectedSpot.id)}
              rating={selectedSpot.rating}
              reviewCount={selectedSpot.reviewCount}
              variant="map"
              verifiedAt={selectedSpot.verifiedAt}
            />
          )}
        </View>
      </View>

      <SpotSearchSheet
        onChangeQuery={setSearchQuery}
        onClose={closeSearch}
        onSelect={handleSearchSelect}
        query={searchQuery}
        spots={filtered}
        visible={searchVisible}
      />

      <FilterSheet
        onClear={clear}
        onClose={() => setFiltersVisible(false)}
        onToggle={toggle}
        resultCount={filtered.length}
        selectedNames={selectedNames}
        visible={filtersVisible}
      />
    </ScreenShell>
  );
}
