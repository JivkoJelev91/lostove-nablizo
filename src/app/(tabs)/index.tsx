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
import { EquipmentFilterChips } from '@/features/spots/equipment-filters';
import { formatDistanceAway } from '@/features/spots/format-distance';
import { byDistance } from '@/features/spots/spot-distance';
import { coverImage } from '@/features/spots/spot-photos';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import { SpotSearchSheet } from '@/features/spots/SpotSearchSheet';
import type { Spot } from '@/features/spots/types';
import { useSpotFilters } from '@/features/spots/useSpotFilters';
import { useSpotsQuery } from '@/features/spots/useSpotsQuery';
import { t } from '@/i18n';

function SpotCardSeparator() {
  return <View className="h-space-16" />;
}

/**
 * The app's home feed: the spots nearest to the athlete, discovered through photos.
 *
 * It sits on the first tab, which lists spots by distance rather than on a map.
 */
export default function HomeScreen() {
  const { data: spots = [], isLoading, isError, refetch } = useSpotsQuery();
  const approvedSpots = useMemo(() => spots.filter((spot) => spot.status === 'approved'), [spots]);
  const { selectedNames, toggle, clear, filtered } = useSpotFilters(approvedSpots);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const nearby = useMemo(
    () => [...filtered].sort(byDistance),
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
          distanceLabel={formatDistanceAway(item.distanceMeters)}
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

  const renderEmpty = useCallback(
    () => (
      <View className="px-screen-px">
        {isLoading ? (
          <EmptyState description={t('common.loading')} padded={false} title={t('home.aroundYou')} />
        ) : isError ? (
          <EmptyState
            action={<GhostButton label="Retry" onPress={() => refetch()} />}
            description={t('common.errorDescription')}
            padded={false}
            title={t('common.errorTitle')}
          />
        ) : (
          <EmptyState
            action={<GhostButton label={t('home.clearFilters')} onPress={clear} />}
            description={t('home.noMatchDescription')}
            padded={false}
            title={t('home.noMatchTitle')}
          />
        )}
      </View>
    ),
    [clear, isError, isLoading, refetch],
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
        spots={nearby}
        visible={searchVisible}
      />
    </>
  );
}
