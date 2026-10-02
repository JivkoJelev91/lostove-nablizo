import { Image, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { SectionHeader } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { useLocalityLabel } from '@/features/location/useLocalityLabel';
import { formatEquipmentSummary } from '@/features/spot-editor/equipment-draft';
import { StepScrollView } from '@/features/spot-editor/StepScrollView';
import type { SpotDraft } from '@/features/spot-editor/types';
import { formatCoordinates } from '@/features/spots/format-coordinates';
import { t } from '@/i18n';

export type AddSpotReviewStepProps = {
  draft: SpotDraft;
};

/** Step 5: everything the wizard collected, in reading order, ready for the final action. */
export function AddSpotReviewStep({ draft }: AddSpotReviewStepProps) {
  const cover = draft.photos[0];
  const locality = useLocalityLabel(draft.coordinate);

  return (
    <StepScrollView>
      <SectionHeader title={t('reviewStep.title')} titleSize="h1" />

      {cover === undefined ? null : (
        <Image
          accessibilityLabel={draft.name}
          className="h-spot-image w-full rounded-lg bg-bg-surface"
          source={{ uri: cover.uri }}
        />
      )}

      <View className="gap-space-4">
        <Text className="font-semibold text-h2 text-text-primary">{draft.name}</Text>
        <Text className="font-regular text-bodySmall text-text-secondary">{draft.description}</Text>
      </View>

      <View className="gap-space-8">
        <SectionHeader accent title={t('reviewStep.equipment')} />
        <Text className="font-regular text-body text-text-primary">
          {formatEquipmentSummary(draft.equipment)}
        </Text>
      </View>

      <View className="gap-space-8">
        <SectionHeader accent title={t('reviewStep.location')} />
        <View className="flex-row items-center gap-space-8">
          <Ionicons color={brandColors.primary} name="location-outline" size={iconSizeValues.sm} />

          <View className="flex-1 gap-space-2">
            <Text className="font-regular text-body text-text-primary">
              {draft.coordinate === null
                ? t('reviewStep.notCaptured')
                : (locality ?? t('reviewStep.currentLocation'))}
            </Text>

            {/* The coordinates are always shown: the geocoder may be offline, and the athlete
                should still be able to check that the pin is where they are. */}
            {draft.coordinate === null ? null : (
              <Text className="font-regular text-caption text-text-muted">
                {formatCoordinates(draft.coordinate)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </StepScrollView>
  );
}
