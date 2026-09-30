import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { EmptyState, ErrorState, LoadingSpinner, PrimaryButton, Skeleton } from '@/components';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';
import { brandColors, iconSizeValues, schemeTextSecondary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export default function FeedbackGalleryScreen() {
  const scheme = useScheme();

  return (
    <GalleryScreen description="Loading, placeholder, empty and error surfaces." title="Feedback">
      <GalleryGroup title="Loading spinner">
        <GalleryRow label="Sizes">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </GalleryRow>

        <GalleryRow label="With a label">
          <LoadingSpinner label="Finding spots near you" />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Skeleton">
        <GalleryRow label="Placeholders" stack>
          <View className="flex-row items-center gap-space-12">
            <Skeleton className="h-review-avatar w-review-avatar rounded-pill" />
            <View className="flex-1 gap-space-4">
              <Skeleton className="h-2 w-40" />
              <Skeleton className="h-2 w-24" />
            </View>
          </View>
          <Skeleton className="h-spot-image w-full rounded-lg" />
          <Skeleton className="h-2 w-3/4" />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Empty state">
        <EmptyState
          action={<PrimaryButton label="Add the first spot" onPress={() => {}} />}
          description="Nothing here yet. Add a spot you train at so others can find it."
          icon={
            <Ionicons
              color={schemeTextSecondary[scheme]}
              name="map-outline"
              size={iconSizeValues.md}
            />
          }
          title="No spots yet"
        />

        <EmptyState title="No reviews" description="Be the first to review this spot." />
      </GalleryGroup>

      <GalleryGroup title="Error state">
        <ErrorState
          description="We could not load the spots. Check your connection and try again."
          onRetry={() => {}}
          title="Could not load spots"
        />

        <ErrorState />
      </GalleryGroup>

      <GalleryGroup title="Icon tones">
        <GalleryRow label="Glyphs">
          <Ionicons color={brandColors.primary} name="checkmark-circle" size={iconSizeValues.md} />
          <Ionicons color={brandColors.primary} name="navigate" size={iconSizeValues.md} />
          <Ionicons color={brandColors.primary} name="camera" size={iconSizeValues.md} />
          <Ionicons
            color={brandColors.primary}
            name="information-circle-outline"
            size={iconSizeValues.md}
          />
        </GalleryRow>
      </GalleryGroup>
    </GalleryScreen>
  );
}
