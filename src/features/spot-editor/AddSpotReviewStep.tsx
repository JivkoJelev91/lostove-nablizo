import { Image, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { SectionHeader } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { describeLocality } from '@/features/spot-editor/coordinates';
import { formatEquipmentSummary } from '@/features/spot-editor/equipment-draft';
import { StepScrollView } from '@/features/spot-editor/StepScrollView';
import type { SpotDraft } from '@/features/spot-editor/types';
import { t } from '@/i18n';

export type AddSpotReviewStepProps = {
  draft: SpotDraft;
};

/** Step 5: everything the wizard collected, in reading order, ready for the final action. */
export function AddSpotReviewStep({ draft }: AddSpotReviewStepProps) {
  const cover = draft.photos[0];

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
          <Text className="flex-1 font-regular text-body text-text-primary">
            {draft.coordinate === null
              ? t('reviewStep.notCaptured')
              : describeLocality(draft.coordinate)}
          </Text>
        </View>
      </View>
    </StepScrollView>
  );
}
