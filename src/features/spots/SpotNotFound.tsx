import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, GhostButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export type SpotNotFoundProps = {
  /** Overrides for a route that knows why it has nothing to render, e.g. a closed spot's edit. */
  title?: string;
  description?: string;
};

/**
 * The screen content for an id no spot matches, shared by the spot page and its edit route so
 * both answer an unknown id the same way.
 */
export function SpotNotFound({ title, description }: SpotNotFoundProps) {
  const scheme = useScheme();

  return (
    <ScreenShell padded={false} title={title ?? 'Spot not found'} variant="stack">
      <EmptyState
        action={<GhostButton label="Back to spots" onPress={() => router.replace('/')} />}
        description={
          description ?? 'The spot you are looking for may have been removed, or the link is wrong.'
        }
        icon={
          <Ionicons
            color={schemeTextMuted[scheme]}
            name="location-outline"
            size={iconSizeValues.md}
          />
        }
        title={title ?? 'Spot not found'}
      />
    </ScreenShell>
  );
}
