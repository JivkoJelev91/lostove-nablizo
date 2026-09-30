import { Text, View } from 'react-native';

import { Card } from '@/components';

export type ProfileStatsProps = {
  spots: number;
  reviews: number;
  favorites: number;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label.toLowerCase()}`}
      className="flex-1 items-center gap-space-2"
    >
      <Text className="font-bold text-h1 text-text-primary">{value}</Text>
      <Text className="text-caption text-text-secondary">{label}</Text>
    </View>
  );
}

/**
 * What the athlete has contributed: spots added, reviews written and places saved.
 *
 * Three equal cells separated by hairlines rather than three cards, because the numbers belong
 * to one identity — a stat that got its own surface would read as three separate facts.
 */
export function ProfileStats({ spots, reviews, favorites }: ProfileStatsProps) {
  return (
    <Card gap="none" padding="md">
      <View className="flex-row items-center">
        <Stat label="Spots" value={spots} />
        <View accessible={false} className="w-px self-stretch bg-border" />
        <Stat label="Reviews" value={reviews} />
        <View accessible={false} className="w-px self-stretch bg-border" />
        <Stat label="Favorites" value={favorites} />
      </View>
    </Card>
  );
}
