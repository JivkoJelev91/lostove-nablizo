import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

export type ProfileStatsProps = {
  spots: number;
  reviews: number;
  favorites: number;
};

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}) {
  const scheme = useScheme();

  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      className="flex-1 items-center gap-space-2"
    >
      <Ionicons color={schemeTextMuted[scheme]} name={icon} size={iconSizeValues.sm} />
      <Text className="font-bold text-h1 text-text-primary">{value}</Text>
      <Text className="text-caption text-text-secondary">{label}</Text>
    </View>
  );
}

/**
 * What the athlete has contributed: spots added, reviews written and places saved.
 *
 * Three equal cells separated by hairlines rather than three cards, because the numbers belong
 * to one identity — a stat that got its own surface would read as three separate facts. Each
 * cell carries the same icon its section uses elsewhere, so the columns read at a glance
 * without adding a third line of text.
 */
export function ProfileStats({ spots, reviews, favorites }: ProfileStatsProps) {
  return (
    <Card gap="none" padding="md">
      <View className="flex-row items-center">
        <Stat icon="location-outline" label={t('profile.stats.spots')} value={spots} />
        <View accessible={false} className="w-px self-stretch bg-border" />
        <Stat icon="star-outline" label={t('profile.stats.reviews')} value={reviews} />
        <View accessible={false} className="w-px self-stretch bg-border" />
        <Stat icon="heart-outline" label={t('profile.stats.favorites')} value={favorites} />
      </View>
    </Card>
  );
}
