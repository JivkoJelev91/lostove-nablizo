import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, GhostButton, ScreenShell, SectionHeader, SpotCard } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { EquipmentFilterChips } from '@/features/spots/equipment-filters';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import { SpotSearchSheet } from '@/features/spots/SpotSearchSheet';
import type { Spot } from '@/features/spots/types';
import { useSpotFilters } from '@/features/spots/useSpotFilters';

/**
 * The app's home feed: the spots nearest to the athlete, discovered through photos.
 *
 * It sits on the first tab, which lists spots by distance rather than on a map.
 */
export default function HomeScreen() {
  const { selectedNames, toggle, clear, filtered } = useSpotFilters(MOCK_SPOTS);
  const [favouriteIds, setFavouriteIds] = useState<readonly string[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const nearby = useMemo(
    () => [...filtered].sort((first, second) => first.distanceKm - second.distanceKm),
    [filtered],
  );

  const toggleFavourite = useCallback((id: string) => {
    setFavouriteIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  }, []);

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

  return (
    <>
      <ScreenShell header={false} padded={false} scroll variant="tab">
        <View className="gap-space-12">
          <View className="px-screen-px">
            <SpotsSearchBar onPress={() => setSearchVisible(true)} />
          </View>

          <EquipmentFilterChips onToggle={toggle} selectedNames={selectedNames} />
        </View>

        <View className="gap-space-12 px-screen-px">
          <SectionHeader
            action={
              <View accessible accessibilityLabel="Spots sorted by distance from you">
                <Ionicons color={brandColors.primary} name="location" size={iconSizeValues.md} />
              </View>
            }
            title="Around you"
            titleSize="h1"
          />

          {nearby.length === 0 ? (
            <EmptyState
              action={<GhostButton label="Clear filters" onPress={clear} />}
              description="No spots carry every selected piece of equipment."
              padded={false}
              title="No spots match"
            />
          ) : (
            <View className="gap-space-16">
              {nearby.map((spot) => (
                <SpotCard
                  key={spot.id}
                  equipment={spot.equipment}
                  imageUri={spot.image}
                  isFavorite={favouriteIds.includes(spot.id)}
                  name={spot.name}
                  onPress={() => openSpot(spot)}
                  onToggleFavorite={() => toggleFavourite(spot.id)}
                  rating={spot.rating}
                  reviewCount={spot.reviewCount}
                  variant="list"
                  verifiedAt={spot.verifiedAt}
                />
              ))}
            </View>
          )}
        </View>
      </ScreenShell>

      <SpotSearchSheet
        onChangeQuery={setSearchQuery}
        onClose={closeSearch}
        onSelect={openSpot}
        query={searchQuery}
        spots={nearby}
        visible={searchVisible}
      />
    </>
  );
}
