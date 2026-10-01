import { useCallback, useMemo, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, GhostButton, ScreenShell, SectionHeader, SpotCard } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { EquipmentFilterChips } from '@/features/spots/equipment-filters';
import { formatDistanceAway } from '@/features/spots/format-distance';
import { coverImage } from '@/features/spots/spot-photos';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import { SpotSearchSheet } from '@/features/spots/SpotSearchSheet';
import type { Spot } from '@/features/spots/types';
import { useSpotFilters } from '@/features/spots/useSpotFilters';
import { useSpots } from '@/features/spots/useSpots';

function SpotCardSeparator() {
  return <View className="h-space-16" />;
}

/**
 * The app's home feed: the spots nearest to the athlete, discovered through photos.
 *
 * It sits on the first tab, which lists spots by distance rather than on a map.
 */
export default function HomeScreen() {
  // Only approved spots are public; one waiting for review is reachable from the profile instead.
  const { approvedSpots } = useSpots();
  const { selectedNames, toggle, clear, filtered } = useSpotFilters(approvedSpots);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const nearby = useMemo(
    () => [...filtered].sort((first, second) => first.distanceKm - second.distanceKm),
    [filtered],
  );

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
          distanceLabel={formatDistanceAway(item.distanceKm)}
          equipment={item.equipment}
          imageUri={coverImage(item)}
          isFavorite={isFavorite(item.id)}
          name={item.name}
          onPress={() => openSpot(item)}
          onToggleFavorite={() => toggleFavorite(item.id)}
          rating={item.rating}
          reviewCount={item.reviewCount}
          variant="list"
          verifiedAt={item.verifiedAt}
        />
      </View>
    ),
    [isFavorite, openSpot, toggleFavorite],
  );

  return (
    <>
      <ScreenShell header={false} padded={false} variant="tab">
        <FlatList
          className="flex-1"
          contentContainerClassName="pb-section-gap-lg"
          data={nearby}
          initialNumToRender={4}
          ItemSeparatorComponent={SpotCardSeparator}
          keyExtractor={(spot) => spot.id}
          ListEmptyComponent={
            <View className="px-screen-px">
              <EmptyState
                action={<GhostButton label="Clear filters" onPress={clear} />}
                description="No spots carry every selected piece of equipment."
                padded={false}
                title="No spots match"
              />
            </View>
          }
          ListHeaderComponent={
            <View className="gap-space-12 pb-space-12">
              <View className="gap-space-12">
                <View className="px-screen-px">
                  <SpotsSearchBar onPress={() => setSearchVisible(true)} />
                </View>

                <EquipmentFilterChips onToggle={toggle} selectedNames={selectedNames} />
              </View>

              <View className="px-screen-px">
                <SectionHeader
                  action={
                    <View accessible accessibilityLabel="Spots sorted by distance from you">
                      <Ionicons
                        color={brandColors.primary}
                        name="location"
                        size={iconSizeValues.md}
                      />
                    </View>
                  }
                  title="Around you"
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
        spots={nearby}
        visible={searchVisible}
      />
    </>
  );
}
