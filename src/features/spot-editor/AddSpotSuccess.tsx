import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { GhostButton, PrimaryButton, Screen } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';

export type AddSpotSuccessProps = {
  onAddAnother: () => void;
  onDone: () => void;
};

/** What the wizard shows once the mock submit finishes. */
export function AddSpotSuccess({ onAddAnother, onDone }: AddSpotSuccessProps) {
  return (
    <Screen edges={['top']}>
      <View className="flex-1 items-center justify-center gap-space-24">
        <View className="h-control w-control items-center justify-center rounded-pill bg-primary">
          <Ionicons color={brandColors.onPrimary} name="checkmark" size={iconSizeValues.md} />
        </View>

        <View className="gap-space-4">
          <Text className="text-center font-bold text-h1 text-text-primary">Spot added</Text>
          <Text className="text-center text-bodySmall text-text-secondary">
            Thanks for contributing. Your spot is now visible to the community.
          </Text>
        </View>

        <View className="w-full gap-space-8">
          <PrimaryButton fullWidth label="Done" onPress={onDone} />
          <GhostButton fullWidth label="Add another spot" onPress={onAddAnother} />
        </View>
      </View>
    </Screen>
  );
}
