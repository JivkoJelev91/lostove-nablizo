import { useMemo } from 'react';
import { Modal as RNModal, ScrollView, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState, IconButton, Rating, SearchInput } from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';

export type SpotSearchSheetProps = {
  visible: boolean;
  /**
   * The query is owned by the screen, not the sheet: closing and reopening must start
   * clean, and the screen already knows when either happens.
   */
  query: string;
  onChangeQuery: (query: string) => void;
  /** The spots the screen is currently showing; search never finds what a filter has hidden. */
  spots: readonly Spot[];
  onClose: () => void;
  onSelect: (spot: Spot) => void;
};

function equipmentSummary(spot: Spot): string {
  return spot.equipment.map((item) => item.name).join(' · ');
}

/** Full-screen search over the discovery screens, as a modal so the field owns the keyboard. */
export function SpotSearchSheet({
  visible,
  query,
  onChangeQuery,
  spots,
  onClose,
  onSelect,
}: SpotSearchSheetProps) {
  const scheme = useScheme();

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (needle.length === 0) {
      return spots;
    }

    return spots.filter((spot) => spot.name.toLowerCase().includes(needle));
  }, [query, spots]);

  return (
    <RNModal animationType="slide" onRequestClose={onClose} statusBarTranslucent visible={visible}>
      <SafeAreaView className="flex-1 bg-bg-main" edges={['top', 'bottom']}>
        <View className="flex-1 gap-section-gap px-screen-px pt-space-8">
          <View className="flex-row items-center gap-space-8">
            <IconButton
              accessibilityLabel="Close search"
              icon={
                <Ionicons
                  color={schemeTextPrimary[scheme]}
                  name="chevron-back"
                  size={iconSizeValues.md}
                />
              }
              onPress={onClose}
            />

            <View className="flex-1">
              <SearchInput
                accessibilityLabel="Search spots"
                autoFocus
                onChangeText={onChangeQuery}
                onClear={() => onChangeQuery('')}
                placeholder="Search spots..."
                value={query}
              />
            </View>
          </View>

          <ScrollView
            contentContainerClassName="gap-list-gap pb-section-gap-lg"
            keyboardShouldPersistTaps="handled"
          >
            {results.length === 0 ? (
              <EmptyState
                description={`Nothing matches "${query.trim()}".`}
                padded={false}
                title="No spots found"
              />
            ) : (
              results.map((spot) => (
                <Card key={spot.id} gap="md" onPress={() => onSelect(spot)} padding="sm">
                  <Text className="font-semibold text-h3 text-text-primary" numberOfLines={1}>
                    {spot.name}
                  </Text>

                  <View className="flex-row items-center justify-between gap-space-8">
                    <Rating
                      count={spot.reviewCount}
                      size="sm"
                      value={spot.rating}
                      variant="summary"
                    />
                    <Text className="shrink text-caption text-text-muted" numberOfLines={1}>
                      {equipmentSummary(spot)}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </RNModal>
  );
}
