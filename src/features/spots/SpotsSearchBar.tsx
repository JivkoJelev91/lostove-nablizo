import { Pressable, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { iconSizeValues, schemePlaceholderColor } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export type SpotsSearchBarProps = {
  onPress: () => void;
};

/**
 * The discovery screens' search affordance.
 *
 * It is a button dressed as a field: tapping it opens the full search screen, so the
 * field never takes focus in place and the keyboard belongs to one owner.
 */
export function SpotsSearchBar({ onPress }: SpotsSearchBarProps) {
  const scheme = useScheme();

  return (
    <Pressable
      accessibilityLabel="Search spots"
      accessibilityRole="button"
      className="h-search flex-row items-center gap-space-8 rounded-pill border border-border bg-surface-input px-space-16 active:bg-bg-surface"
      onPress={onPress}
    >
      <Ionicons color={schemePlaceholderColor[scheme]} name="search" size={iconSizeValues.sm} />
      <Text className="text-body text-text-muted">Search spots...</Text>
    </Pressable>
  );
}
