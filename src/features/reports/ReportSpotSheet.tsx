import { useState } from 'react';
import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { BottomSheet, FilterChip, PrimaryButton, TextArea } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { REPORT_DETAILS_MAX_LENGTH, REPORT_REASONS } from '@/features/reports/report-reasons';
import type { ReportReason } from '@/features/reports/report-reasons';
import { useReportSpotMutation } from '@/features/spots/useSpotsQuery';
import { t } from '@/i18n';

export type ReportSpotSheetProps = {
  visible: boolean;
  spotId: string;
  spotName: string;
  onClose: () => void;
};

/**
 * The sheet that files a report against a spot.
 *
 * The reason is the required part — the queue triages by it — and the note is optional detail.
 * The sheet is remounted by its caller on each open, so a cancelled draft never survives into the
 * next one, and a submitted report is replaced by a confirmation rather than a toast: the athlete
 * asked the app to do something on their behalf, and the answer should name what happened.
 */
export function ReportSpotSheet({ visible, spotId, spotName, onClose }: ReportSpotSheetProps) {
  const report = useReportSpotMutation();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (reason === null || report.isPending) {
      return;
    }

    const trimmed = details.trim();

    try {
      await report.mutateAsync({
        spotId,
        reason,
        ...(trimmed === '' ? {} : { description: trimmed }),
      });

      setSubmitted(true);
    } catch {
      // The mutation carries the error state; the sheet stays open so the draft is not lost.
    }
  };

  if (submitted) {
    return (
      <BottomSheet onClose={onClose} visible={visible}>
        <View className="items-center gap-space-12 py-space-16">
          <Ionicons color={brandColors.primary} name="checkmark-circle" size={iconSizeValues.lg} />
          <Text className="font-semibold text-h2 text-text-primary">{t('report.thanksTitle')}</Text>
          <Text className="text-center text-bodySmall text-text-secondary">
            {t('report.thanksDescription')}
          </Text>
          <PrimaryButton fullWidth label={t('report.done')} onPress={onClose} />
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      dismissible={!report.isPending}
      onClose={onClose}
      title={t('report.title')}
      visible={visible}
    >
      <View className="gap-space-4">
        <Text className="font-semibold text-h3 text-text-primary">{spotName}</Text>
        <Text className="text-bodySmall text-text-secondary">{t('report.intro')}</Text>
      </View>

      <View className="gap-space-8">
        <Text className="font-medium text-bodySmall text-text-secondary">
          {t('report.reasonLabel')}
        </Text>
        <View className="flex-row flex-wrap gap-space-8">
          {REPORT_REASONS.map((value) => (
            <FilterChip
              key={value}
              label={t(`report.reason.${value}`)}
              onPress={() => setReason(value)}
              selected={reason === value}
            />
          ))}
        </View>
      </View>

      <TextArea
        label={t('report.detailsLabel')}
        maxLength={REPORT_DETAILS_MAX_LENGTH}
        onChangeText={setDetails}
        placeholder={t('report.detailsPlaceholder')}
        value={details}
      />

      {report.isError ? (
        <Text className="text-caption text-status-bad">{t('report.failed')}</Text>
      ) : null}

      <PrimaryButton
        disabled={reason === null}
        fullWidth
        label={t('report.submit')}
        loading={report.isPending}
        onPress={() => void submit()}
      />
    </BottomSheet>
  );
}
