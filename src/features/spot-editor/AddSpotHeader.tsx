import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { IconButton } from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import type { AddSpotStep } from '@/features/spot-editor/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type AddSpotHeaderProps = {
  step: AddSpotStep;
  totalSteps?: number;
  onBack: () => void;
  className?: string;
};

/** The wizard's chrome: a back control, the flow's name, and the positional step segments. */
export function AddSpotHeader({ step, totalSteps = 5, onBack, className }: AddSpotHeaderProps) {
  const scheme = useScheme();

  return (
    <View className={cn('gap-space-12 px-screen-px pt-space-8', className)}>
      <View className="flex-row items-center gap-space-8">
        <IconButton
          accessibilityLabel={t('common.back')}
          icon={
            <Ionicons
              color={schemeTextPrimary[scheme]}
              name="chevron-back"
              size={iconSizeValues.md}
            />
          }
          onPress={onBack}
          variant="surface"
        />

        <Text className="flex-1 font-semibold text-h2 text-text-primary">{t('editor.title')}</Text>

        <Text className="text-bodySmall text-text-secondary">{`${step} / ${totalSteps}`}</Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ max: totalSteps, min: 1, now: step }}
        className="flex-row gap-space-4"
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            className={cn('h-1 flex-1 rounded-pill', index < step ? 'bg-primary' : 'bg-border')}
            key={index}
          />
        ))}
      </View>
    </View>
  );
}
