import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { EmptyState, PrimaryButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { ProfileReviewCard } from '@/features/profile/ProfileReviewCard';
import { useProfile } from '@/features/profile/useProfile';
import type { OwnReview } from '@/features/reviews/useOwnReviewsQuery';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

/**
 * Every review the athlete has written, newest first, each one opening the spot it is about.
 */
export default function ProfileReviewsScreen() {
  const scheme = useScheme();
  const { reviews } = useProfile();

  const renderReview = ({ item }: ListRenderItemInfo<OwnReview>) => (
    <ProfileReviewCard review={item} />
  );

  return (
    <ScreenShell
      description={t('profile.allReviewsDescription')}
      title={t('profile.allReviewsTitle')}
    >
      <FlatList
        className="flex-1"
        contentContainerClassName={cn(
          'gap-space-16 pb-section-gap-lg',
          reviews.length === 0 && 'grow',
        )}
        data={reviews}
        keyExtractor={(review) => review.id}
        ListEmptyComponent={
          <EmptyState
            action={
              <PrimaryButton
                label={t('profile.allReviewsFindSpot')}
                onPress={() => router.navigate('/')}
              />
            }
            className="flex-1 justify-center"
            description={t('profile.allReviewsEmptyDescription')}
            icon={
              <Ionicons
                color={schemeTextMuted[scheme]}
                name="star-outline"
                size={iconSizeValues.lg}
              />
            }
            padded={false}
            title={t('profile.allReviewsEmptyTitle')}
          />
        }
        renderItem={renderReview}
      />
    </ScreenShell>
  );
}
