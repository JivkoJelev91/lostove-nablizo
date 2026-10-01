import { useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, Modal as RNModal, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState, IconButton, Rating, SearchInput } from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { equipmentLabel } from '@/i18n/equipment';

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
  return spot.equipment.map((item) => equipmentLabel(item.name)).join(' · ');
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

  const renderResult = useCallback(
    ({ item }: ListRenderItemInfo<Spot>) => (
      <Card gap="md" onPress={() => onSelect(item)} padding="sm">
        <Text className="font-semibold text-h3 text-text-primary" numberOfLines={1}>
          {item.name}
        </Text>

        <View className="flex-row items-center justify-between gap-space-8">
          <Rating count={item.reviewCount} size="sm" value={item.rating} variant="summary" />
          <Text className="shrink text-caption text-text-muted" numberOfLines={1}>
            {equipmentSummary(item)}
          </Text>
        </View>
      </Card>
    ),
    [onSelect],
  );

  return (
    <RNModal animationType="slide" onRequestClose={onClose} statusBarTranslucent visible={visible}>
      <SafeAreaView className="flex-1 bg-bg-main" edges={['top', 'bottom']}>
        <View className="flex-1 gap-section-gap px-screen-px pt-space-8">
          <View className="flex-row items-center gap-space-8">
            <IconButton
              accessibilityLabel={t('search.close')}
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
                accessibilityLabel={t('search.title')}
                autoFocus
                onChangeText={onChangeQuery}
                onClear={() => onChangeQuery('')}
                placeholder={t('search.placeholder')}
                value={query}
              />
            </View>
          </View>

          <FlatList
            className="flex-1"
            contentContainerClassName="gap-list-gap pb-section-gap-lg"
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(spot) => spot.id}
            ListEmptyComponent={
              <EmptyState
                description={t('search.noResultsDescription', { query: query.trim() })}
                padded={false}
                title={t('search.noResultsTitle')}
              />
            }
            renderItem={renderResult}
          />
        </View>
      </SafeAreaView>
    </RNModal>
  );
}
