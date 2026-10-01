import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { EmptyState, PrimaryButton, ScreenShell, SpotCard } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { coverImage } from '@/features/spots/spot-photos';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { cn } from '@/utils/cn';

/**
 * The spots the athlete has saved, so a place found once can be found again without searching
 * for it. The heart on each card un-saves the spot, so the list doubles as the way out.
 */
export default function FavoritesScreen() {
  const scheme = useScheme();
  const { spots, isFavorite, toggle } = useFavorites();

  const openSpot = (spot: Spot) => {
    router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
  };

  const renderSpot = ({ item }: ListRenderItemInfo<Spot>) => (
    <SpotCard
      equipment={item.equipment}
      imageUri={coverImage(item)}
      isFavorite={isFavorite(item.id)}
      name={item.name}
      onPress={() => openSpot(item)}
      onToggleFavorite={() => toggle(item.id)}
      rating={item.rating}
      reviewCount={item.reviewCount}
      verifiedAt={item.verifiedAt}
      variant="list"
    />
  );

  return (
    <ScreenShell description="Your saved spots" title="Favorites" variant="tab">
      <FlatList
        className="flex-1"
        contentContainerClassName={cn(
          'gap-space-16 pb-section-gap-lg',
          spots.length === 0 && 'grow',
        )}
        data={spots}
        keyExtractor={(spot) => spot.id}
        ListEmptyComponent={
          <EmptyState
            action={<PrimaryButton label="Explore spots" onPress={() => router.navigate('/')} />}
            className="flex-1 justify-center"
            description="Save places you want to visit later."
            icon={
              <Ionicons
                color={schemeTextMuted[scheme]}
                name="heart-outline"
                size={iconSizeValues.lg}
              />
            }
            padded={false}
            title="No saved spots yet"
          />
        }
        renderItem={renderSpot}
      />
    </ScreenShell>
  );
}
