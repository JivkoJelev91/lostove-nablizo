import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, GhostButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

/**
 * The screen content for an id no mock spot matches, shared by the spot page and its edit
 * route so both answer an unknown id the same way.
 */
export function SpotNotFound() {
  const scheme = useScheme();

  return (
    <ScreenShell padded={false} title="Spot not found" variant="stack">
      <EmptyState
        action={<GhostButton label="Back to spots" onPress={() => router.replace('/')} />}
        description="The spot you are looking for may have been removed, or the link may be wrong."
        icon={
          <Ionicons
            color={schemeTextMuted[scheme]}
            name="location-outline"
            size={iconSizeValues.md}
          />
        }
        title="Spot not found"
      />
    </ScreenShell>
  );
}
