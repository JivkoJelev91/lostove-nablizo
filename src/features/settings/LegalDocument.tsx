import { Text, View } from 'react-native';

import { ScreenShell, SectionHeader } from '@/components';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';
import { formatMonthDayYear } from '@/utils/dates';

export type LegalSection = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

export type LegalDocumentProps = {
  titleKey: TranslationKey;
  introKey: TranslationKey;
  sections: readonly LegalSection[];
};

/**
 * Where questions about the app go until a support address exists.
 *
 * The repository is public, so an issue is a real channel today; replace this with a support
 * mailbox before the store release and the policy follows.
 */
const CONTACT = 'https://github.com/JivkoJelev91/lostove-nablizo/issues';

/** The date the documents were last revised, shown under the title. */
const UPDATED = new Date('2026-10-02');

/**
 * A legal document: a title, an intro and headed sections, all in the settings shell so it
 * scrolls and carries the same back control as every other pushed screen.
 */
export function LegalDocument({ titleKey, introKey, sections }: LegalDocumentProps) {
  const params = { contact: CONTACT };

  return (
    <ScreenShell
      description={t('legal.updated', { date: formatMonthDayYear(UPDATED) })}
      scroll
      title={t(titleKey)}
      variant="stack"
    >
      <View className="gap-section-gap">
        <Text className="font-regular text-body text-text-primary">{t(introKey)}</Text>

        {sections.map((section) => (
          <View className="gap-space-8" key={section.titleKey}>
            <SectionHeader accent title={t(section.titleKey)} />
            <Text className="font-regular text-body text-text-secondary">
              {t(section.bodyKey, params)}
            </Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}
