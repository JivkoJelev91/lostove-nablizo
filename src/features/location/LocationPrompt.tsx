import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Card, SecondaryButton } from '@/components';
import { brandColors, iconSizeValues, statusColors } from '@/constants/design-tokens';
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
 * The feed's note about location, whether it is off or the fix failed.
 *
 * Asking is a screen's job and this is the screen that benefits, so the request lives beside the
 * sentence that says what it is for. Once permission is granted the prompt is replaced rather than
 * removed: a fix that fails used to be silent, leaving the athlete with unlabelled distances and
 * no explanation. The failure says what happened and offers the retry, and the feed meanwhile
 * serves the whole directory, so the note explains a fallback rather than blocking one.
 */
export function LocationPrompt({ location }: LocationPromptProps) {
  const { failed, granted, request, resolved, retry } = location;

  if (!resolved) {
    return null;
  }

  if (granted && !failed) {
    return null;
  }

  return (
    <Card gap="md" variant="flat">
      <View className="flex-row items-center gap-space-8">
        <Ionicons
          color={granted ? statusColors.warning : brandColors.primary}
          name="navigate-outline"
          size={iconSizeValues.sm}
        />
        <Text className="flex-1 font-semibold text-body text-text-primary">
          {granted ? t('home.locationFailedTitle') : t('home.locationTitle')}
        </Text>
      </View>

      <Text className="font-regular text-bodySmall text-text-secondary">
        {granted ? t('home.locationFailedDescription') : t('home.locationDescription')}
      </Text>

      <SecondaryButton
        fullWidth
        label={granted ? t('common.tryAgain') : t('home.locationEnable')}
        onPress={granted ? retry : request}
      />
    </Card>
  );
}
