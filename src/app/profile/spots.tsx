import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { EmptyState, PrimaryButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { ProfileSpotCard } from '@/features/profile/ProfileSpotCard';
import { useProfile } from '@/features/profile/useProfile';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

/**
 * Everything the athlete has added, including the spots moderation has not cleared yet, each
 * labelled with where it sits in review.
 */
export default function ProfileSpotsScreen() {
  const scheme = useScheme();
  const { spots } = useProfile();

  const openSpot = (spot: Spot) => {
    router.push({ pathname: '/spot/[id]', params: { id: spot.id } });
  };

  const renderSpot = ({ item }: ListRenderItemInfo<Spot>) => (
    <ProfileSpotCard onPress={() => openSpot(item)} spot={item} />
  );

  return (
    <ScreenShell description={t('profile.allSpotsDescription')} title={t('profile.allSpotsTitle')}>
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
            action={
              <PrimaryButton
                label={t('profile.allSpotsAdd')}
                onPress={() => router.navigate('/(tabs)/add')}
              />
            }
            className="flex-1 justify-center"
            description={t('profile.allSpotsEmptyDescription')}
            icon={
              <Ionicons
                color={schemeTextMuted[scheme]}
                name="location-outline"
                size={iconSizeValues.lg}
              />
            }
            padded={false}
            title={t('profile.allSpotsEmptyTitle')}
          />
        }
        renderItem={renderSpot}
      />
    </ScreenShell>
  );
}
