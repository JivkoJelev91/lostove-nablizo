import { Ionicons } from '@expo/vector-icons';

import { IconButton } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';

export type LocateButtonProps = {
  onPress: () => void;
};

/** The floating control that brings the map back to the mock user location. */
export function LocateButton({ onPress }: LocateButtonProps) {
  return (
    <IconButton
      accessibilityLabel="Show my location"
      className="shadow-card-elevated"
      icon={<Ionicons color={brandColors.primary} name="locate" size={iconSizeValues.md} />}
      onPress={onPress}
      size="lg"
      variant="surface"
    />
  );
}
