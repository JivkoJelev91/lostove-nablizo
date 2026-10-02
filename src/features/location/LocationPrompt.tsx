import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SecondaryButton } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import type { UserLocation } from '@/features/location/useUserLocation';
import { t } from '@/i18n';

export type LocationPromptProps = {
  /**
   * The shared location state, passed in rather than read here.
   *
   * The permission lives in one hook instance for a reason: asking to read the permission from a
   * second place would give the screen two copies, and the one the feed reads is only refreshed by
   * its own request. Enabling location in this button has to be visible to the query that fetches
   * the nearby spots, and one instance is what makes that true.
   */
  location: UserLocation;
};

/**
 * The feed's invitation to turn location on, shown only while it is off.
 *
 * Asking is a screen's job and this is the screen that benefits, so the request lives beside the
 * sentence that says what it is for. The component renders nothing at all once permission is
 * granted — including while the first fix is still arriving — because a prompt that lingers after
 * it has been answered reads as a bug.
 */
export function LocationPrompt({ location }: LocationPromptProps) {
  const { granted, request, resolved } = location;

  if (!resolved || granted) {
    return null;
  }

  return (
    <View className="gap-space-8 rounded-lg border border-border bg-bg-surface px-space-16 py-space-12">
      <View className="flex-row items-center gap-space-8">
        <Ionicons color={brandColors.primary} name="navigate-outline" size={iconSizeValues.sm} />
        <Text className="flex-1 font-semibold text-body text-text-primary">
          {t('home.locationTitle')}
        </Text>
      </View>

      <Text className="text-bodySmall text-text-secondary">{t('home.locationDescription')}</Text>

      <SecondaryButton fullWidth label={t('home.locationEnable')} onPress={request} />
    </View>
  );
}
