import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { GhostButton, PrimaryButton, Screen, SpotStatusBadge } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { Confetti } from '@/features/spot-editor/Confetti';
import { t } from '@/i18n';

export type AddSpotSuccessProps = {
  /** The name of the spot just submitted, so the confirmation is about a real place. */
  spotName: string;
  onAddAnother: () => void;
  onViewSpot: () => void;
};

/**
 * What the wizard shows once the submit finishes: the spot exists, but moderation has not
 * cleared it, so the copy must not promise that it is public yet. The burst is short and the
 * screen underneath is already tappable; it celebrates the submission, not an approval.
 */
export function AddSpotSuccess({ spotName, onAddAnother, onViewSpot }: AddSpotSuccessProps) {
  return (
    <Screen edges={['top']}>
      <View className="flex-1 items-center justify-center gap-space-24">
        <Animated.View
          className="h-control w-control items-center justify-center rounded-pill bg-primary"
          entering={ZoomIn.duration(260).reduceMotion(ReduceMotion.System)}
        >
          <Ionicons color={brandColors.onPrimary} name="checkmark" size={iconSizeValues.md} />
        </Animated.View>

        <Animated.View
          className="items-center gap-space-8"
          entering={FadeIn.delay(120).duration(240).reduceMotion(ReduceMotion.System)}
        >
          <Text className="text-center font-bold text-h1 text-text-primary">
            {t('success.title')}
          </Text>

          <View className="flex-row justify-center">
            <SpotStatusBadge status="under_review" />
          </View>

          <Text className="text-center text-bodySmall text-text-secondary">
            {t('success.message', { name: spotName })}
          </Text>
        </Animated.View>

        <View className="w-full gap-space-8">
          <PrimaryButton fullWidth label={t('success.viewSpot')} onPress={onViewSpot} />
          <GhostButton fullWidth label={t('success.addAnother')} onPress={onAddAnother} />
        </View>
      </View>

      {/* Last, so the burst draws over the copy and the buttons rather than behind them. */}
      <Confetti />
    </Screen>
  );
}
