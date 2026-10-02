import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import {
  EmptyState,
  LoadingSpinner,
  PrimaryButton,
  ScreenShell,
  SpotCard,
} from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useFavorites } from '@/features/favorites/useFavorites';
import { coverImage } from '@/features/spots/spot-photos';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

/**
 * The spots the athlete has saved, so a place found once can be found again without searching
 * for it. The heart on each card un-saves the spot, so the list doubles as the way out.
 *
 * A guest gets the sign-in prompt rather than an empty list, and it is a different prompt from the
 * "you have not saved anything" one. An empty list tells a signed-in athlete their account is
 * empty, which is true; the same screen telling a guest it is empty would be a lie about a list
 * they have never had, and would leave them with nothing to act on.
 */
export default function FavoritesScreen() {
  const scheme = useScheme();
  const { spots, isFavorite, toggle, loading, signedIn } = useFavorites();

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

  if (!signedIn) {
    return (
      <ScreenShell description={t('favorites.description')} title={t('favorites.title')} variant="tab">
        <View className="flex-1 justify-center">
          <EmptyState
            action={
              <PrimaryButton
                label={t('auth.guard.signIn')}
                onPress={() => router.push({ pathname: '/auth', params: { next: '/favorites' } })}
              />
            }
            description={t('auth.guard.reason')}
            icon={
              <Ionicons
                color={schemeTextMuted[scheme]}
                name="lock-closed-outline"
                size={iconSizeValues.lg}
              />
            }
            padded={false}
            title={t('auth.guard.title')}
          />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      description={t('favorites.description')}
      title={t('favorites.title')}
      variant="tab"
    >
      <FlatList
        className="flex-1"
        contentContainerClassName={cn(
          'gap-space-16 pb-section-gap-lg',
          spots.length === 0 && !loading && 'grow',
        )}
        data={spots}
        keyExtractor={(spot) => spot.id}
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 items-center justify-center">
              <LoadingSpinner />
            </View>
          ) : (
            <EmptyState
              action={
                <PrimaryButton
                  label={t('favorites.explore')}
                  onPress={() => router.navigate('/')}
                />
              }
              className="flex-1 justify-center"
              description={t('favorites.emptyDescription')}
              icon={
                <Ionicons
                  color={schemeTextMuted[scheme]}
                  name="heart-outline"
                  size={iconSizeValues.lg}
                />
              }
              padded={false}
              title={t('favorites.emptyTitle')}
            />
          )
        }
        renderItem={renderSpot}
      />
    </ScreenShell>
  );
}
