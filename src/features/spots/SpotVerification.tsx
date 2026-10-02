import { Text, View } from 'react-native';

import { VerificationBadge } from '@/components';
import type { VerifiedAt } from '@/components';
import type { VerificationSource } from '@/features/spots/types';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

const SOURCE_KEYS: Record<VerificationSource, TranslationKey> = {
  import: 'verification.source.import',
  moderator: 'verification.source.moderator',
  user: 'verification.source.user',
};

export type SpotVerificationProps = {
  verifiedAt?: VerifiedAt;
  source?: VerificationSource;
  /** Distinct athletes who confirmed the spot; hidden at zero and when the query did not ask. */
  confirmations?: number;
};

/**
 * The verification badge with the source of the check beside it, for the spot page.
 *
 * The card version stays a badge alone: a list row already carries a photo, a name, a rating and
 * two equipment lines, and who signed off on the spot is detail-page business. A spot nobody has
 * checked renders nothing here -- an unknown date is not a verification.
 */
export function SpotVerification({ verifiedAt, source, confirmations }: SpotVerificationProps) {
  if (verifiedAt === undefined) return null;

  return (
    <View className="flex-row flex-wrap items-center gap-space-8">
      <VerificationBadge verifiedAt={verifiedAt} />

      {source === undefined ? null : (
        <Text className="text-caption text-text-secondary">{t(SOURCE_KEYS[source])}</Text>
      )}

      {confirmations === undefined || confirmations === 0 ? null : (
        <Text className="text-caption text-text-secondary">
          {confirmations === 1
            ? t('verification.confirmations.one')
            : t('verification.confirmations.few', { count: confirmations })}
        </Text>
      )}
    </View>
  );
}
