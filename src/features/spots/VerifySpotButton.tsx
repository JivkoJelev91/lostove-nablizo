import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { GhostButton } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { useRequireAuth } from '@/features/auth/useRequireAuth';
import { useVerifySpotMutation } from '@/features/spots/useSpotsQuery';
import { t } from '@/i18n';

export type VerifySpotButtonProps = {
  spotId: string;
};

/**
 * The community confirmation action for an approved spot.
 *
 * Success is visible without a message: the badge above turns green and says "today", and the
 * spot travels back with a fresh date on every list. Failure is not, so it gets a caption -- a
 * tap that silently did nothing would read as the app losing the confirmation.
 *
 * A guest is sent to sign in by {@link useRequireAuth} rather than being shown a dead button,
 * matching every other protected action on the page.
 */
export function VerifySpotButton({ spotId }: VerifySpotButtonProps) {
  const { requireAuth } = useRequireAuth();
  const verify = useVerifySpotMutation();

  return (
    <View className="gap-space-8">
      <GhostButton
        fullWidth
        label={t('spot.verify')}
        leftIcon={
          <Ionicons
            color={brandColors.primary}
            name="checkmark-circle-outline"
            size={iconSizeValues.sm}
          />
        }
        loading={verify.isPending}
        onPress={() => requireAuth(() => verify.mutate(spotId))}
      />

      {verify.isError ? (
        <Text className="text-caption text-status-bad">{t('spot.verifyFailed')}</Text>
      ) : null}
    </View>
  );
}
