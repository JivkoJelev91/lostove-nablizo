import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, PrimaryButton, ScreenShell, SpotCard } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';

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

  return (
    <ScreenShell description="Your saved spots" scroll title="Favorites" variant="tab">
      {spots.length === 0 ? (
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
      ) : (
        <View className="gap-space-16">
          {spots.map((spot) => (
            <SpotCard
              equipment={spot.equipment}
              imageUri={spot.image}
              isFavorite={isFavorite(spot.id)}
              key={spot.id}
              name={spot.name}
              onPress={() => openSpot(spot)}
              onToggleFavorite={() => toggle(spot.id)}
              rating={spot.rating}
              reviewCount={spot.reviewCount}
              verifiedAt={spot.verifiedAt}
              variant="list"
            />
          ))}
        </View>
      )}
    </ScreenShell>
  );
}
