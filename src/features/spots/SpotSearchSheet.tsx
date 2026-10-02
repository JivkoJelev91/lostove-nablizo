import { useCallback } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, Modal as RNModal, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState, IconButton, LoadingSpinner, Rating, SearchInput } from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { SEARCH_MIN_QUERY_LENGTH } from '@/features/spots/spots-api';
import type { Spot } from '@/features/spots/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { equipmentLabel } from '@/i18n/equipment';

export type SpotSearchSheetProps = {
  visible: boolean;
  /**
   * The query is owned by the screen, not the sheet: closing and reopening must start clean,
   * and the screen already knows when either happens.
   */
  query: string;
  onChangeQuery: (query: string) => void;
  /** The database's answer once the term is long enough to search. */
  results: readonly Spot[];
  /** What to browse before a query is typed: the feed the athlete was already looking at. */
  browseSpots: readonly Spot[];
  /** True while a search request is in flight. */
  searching: boolean;
  onClose: () => void;
  onSelect: (spot: Spot) => void;
};

function equipmentSummary(spot: Spot): string {
  return spot.equipment.map((item) => equipmentLabel(item.name)).join(' · ');
}

/**
 * Full-screen search over the directory, as a modal so the field owns the keyboard.
 *
 * A term shorter than the minimum browses the feed the athlete came from; a longer one is a
 * database search across every approved spot, not a filter over what this screen already
 * downloaded. That distinction is what lets a search find a spot in Varna while the feed is
 * showing Sofia.
 */
export function SpotSearchSheet({
  visible,
  query,
  onChangeQuery,
  results,
  browseSpots,
  searching,
  onClose,
  onSelect,
}: SpotSearchSheetProps) {
  const scheme = useScheme();
  const trimmed = query.trim();
  const isSearching = trimmed.length >= SEARCH_MIN_QUERY_LENGTH;
  const shown = isSearching ? results : browseSpots;
  const waiting = isSearching && searching && results.length === 0;

  const renderResult = useCallback(
    ({ item }: ListRenderItemInfo<Spot>) => (
      <Card gap="md" onPress={() => onSelect(item)} padding="sm">
        <View className="gap-space-4">
          <Text className="font-semibold text-h3 text-text-primary" numberOfLines={1}>
            {item.name}
          </Text>

          {item.city === null ? null : (
            <Text className="text-caption text-text-muted" numberOfLines={1}>
              {item.city}
            </Text>
          )}
        </View>

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
            data={shown}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(spot) => spot.id}
            ListEmptyComponent={
              waiting ? (
                <View className="items-center justify-center pt-space-24">
                  <LoadingSpinner />
                </View>
              ) : isSearching ? (
                <EmptyState
                  description={t('search.noResultsDescription', { query: trimmed })}
                  padded={false}
                  title={t('search.noResultsTitle')}
                />
              ) : null
            }
            renderItem={renderResult}
          />
        </View>
      </SafeAreaView>
    </RNModal>
  );
}
