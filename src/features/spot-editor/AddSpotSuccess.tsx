import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { GhostButton, PrimaryButton, Screen, SpotStatusBadge } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';

export type AddSpotSuccessProps = {
  /** The name of the spot just submitted, so the confirmation is about a real place. */
  spotName: string;
  onAddAnother: () => void;
  onViewSpot: () => void;
};

/**
 * What the wizard shows once the submit finishes: the spot exists, but moderation has not
 * cleared it, so the copy must not promise that it is public yet.
 */
export function AddSpotSuccess({ spotName, onAddAnother, onViewSpot }: AddSpotSuccessProps) {
  return (
    <Screen edges={['top']}>
      <View className="flex-1 items-center justify-center gap-space-24">
        <View className="h-control w-control items-center justify-center rounded-pill bg-primary">
          <Ionicons color={brandColors.onPrimary} name="checkmark" size={iconSizeValues.md} />
        </View>

        <View className="items-center gap-space-8">
          <Text className="text-center font-bold text-h1 text-text-primary">Spot submitted</Text>

          <View className="flex-row justify-center">
            <SpotStatusBadge status="under_review" />
          </View>

          <Text className="text-center text-bodySmall text-text-secondary">
            {`Thanks for contributing. ${spotName} is waiting for approval and stays in your profile until a moderator publishes it.`}
          </Text>
        </View>

        <View className="w-full gap-space-8">
          <PrimaryButton fullWidth label="View your spot" onPress={onViewSpot} />
          <GhostButton fullWidth label="Add another spot" onPress={onAddAnother} />
        </View>
      </View>
    </Screen>
  );
}
