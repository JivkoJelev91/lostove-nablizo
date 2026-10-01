import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, GhostButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

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
    <ScreenShell padded={false} title={title ?? t('spot.notFoundTitle')} variant="stack">
      <EmptyState
        action={<GhostButton label={t('spot.backToSpots')} onPress={() => router.replace('/')} />}
        description={description ?? t('spot.notFoundDescription')}
        icon={
          <Ionicons
            color={schemeTextMuted[scheme]}
            name="location-outline"
            size={iconSizeValues.md}
          />
        }
        title={title ?? t('spot.notFoundTitle')}
      />
    </ScreenShell>
  );
}
