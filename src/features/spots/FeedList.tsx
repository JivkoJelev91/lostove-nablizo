import type { ListRenderItem } from 'react-native';
import { FlatList, RefreshControl, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  BrandLogo,
  EmptyState,
  ErrorState,
  GhostButton,
  LoadingSpinner,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from '@/components';
import { brandColors, iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { LocationPrompt } from '@/features/location/LocationPrompt';
import type { UserLocation } from '@/features/location/useUserLocation';
import { EquipmentFilterChips } from '@/features/spots/equipment-filters';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import type { Spot } from '@/features/spots/types';
import { NEARBY_RADIUS_M } from '@/features/spots/useSpotsQuery';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

function SpotCardSeparator() {
  return <View className="h-list-gap" />;
}

type FeedEmptyStateProps = {
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  /** Whether the rows were measured from a position, which decides what an empty list means. */
  measured: boolean;
  onAddSpot: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onSearchElsewhere: () => void;
};

/**
 * What the feed shows when it has no rows, and the reason why.
 *
 * The four cases are four different facts: not loaded yet, failed to load, filtered down to
 * nothing, or simply nothing here. Each has its own next step — wait, retry, clear the filters,
 * or look elsewhere — and collapsing them into one message would blame the athlete for a state
 * they did not create. The two "nothing here" branches also carry the action their copy asks
 * for: a directory can reach a term, an empty directory can reach the add screen, and neither
 * sentence should end without a way to do what it suggests.
 */
function FeedEmptyState({
  hasFilters,
  isError,
  isLoading,
  measured,
  onAddSpot,
  onClearFilters,
  onRetry,
  onSearchElsewhere,
}: FeedEmptyStateProps) {
  const scheme = useScheme();

  if (isLoading) {
    return <LoadingSpinner className="py-section-gap" />;
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (hasFilters) {
    return (
      <EmptyState
        action={<GhostButton label={t('home.clearFilters')} onPress={onClearFilters} />}
        description={t('home.noMatchDescription')}
        icon={
          <Ionicons
            color={schemeTextMuted[scheme]}
            name="options-outline"
            size={iconSizeValues.lg}
          />
        }
        padded={false}
        title={t('home.noMatchTitle')}
      />
    );
  }

  // Nothing within the radius is a different fact from nothing in the directory: the first can be
  // answered by looking elsewhere, the second by adding the first spot. Saying "no match" here
  // would blame filters nobody set.
  if (measured) {
    return (
      <EmptyState
        action={<GhostButton label={t('home.searchElsewhere')} onPress={onSearchElsewhere} />}
        description={t('home.nearbyEmptyDescription', { radius: NEARBY_RADIUS_M / 1000 })}
        icon={
          <Ionicons
            color={schemeTextMuted[scheme]}
            name="location-outline"
            size={iconSizeValues.lg}
          />
        }
        padded={false}
        title={t('home.nearbyEmptyTitle')}
      />
    );
  }

  return (
    <EmptyState
      action={<PrimaryButton label={t('nav.addSpotLabel')} onPress={onAddSpot} />}
      description={t('home.emptyDescription')}
      icon={
        <Ionicons
          color={schemeTextMuted[scheme]}
          name="location-outline"
          size={iconSizeValues.lg}
        />
      }
      padded={false}
      title={t('home.emptyTitle')}
    />
  );
}

type FeedHeaderProps = {
  filterCount: number;
  location: UserLocation;
  selectedEquipment: readonly string[];
  onClearEquipment: () => void;
  onOpenFilters: () => void;
  onOpenSearch: () => void;
  onToggleEquipment: (name: string) => void;
};

/** The feed's top matter: brand, search and filters, the location ask, and the section heading. */
function FeedHeader({
  filterCount,
  location,
  selectedEquipment,
  onClearEquipment,
  onOpenFilters,
  onOpenSearch,
  onToggleEquipment,
}: FeedHeaderProps) {
  return (
    <View className="gap-space-12 pb-space-12">
      <View className="px-screen-px">
        <BrandLogo />
      </View>

      <View className="gap-space-12">
        <View className="flex-row items-center gap-space-8 px-screen-px">
          <View className="flex-1">
            <SpotsSearchBar onPress={onOpenSearch} />
          </View>

          <SecondaryButton
            label={
              filterCount > 0
                ? t('filters.openWithCount', { count: filterCount })
                : t('filters.open')
            }
            leftIcon={
              <Ionicons
                color={brandColors.primary}
                name="options-outline"
                size={iconSizeValues.sm}
              />
            }
            onPress={onOpenFilters}
            size="sm"
          />
        </View>

        <EquipmentFilterChips
          onClear={onClearEquipment}
          onToggle={onToggleEquipment}
          selectedNames={selectedEquipment}
        />
      </View>

      <View className="px-screen-px">
        <LocationPrompt location={location} />
      </View>

      <View className="px-screen-px">
        <SectionHeader
          action={
            <View accessible accessibilityLabel={t('home.sortedByDistance')}>
              <Ionicons color={brandColors.primary} name="location" size={iconSizeValues.md} />
            </View>
          }
          title={t('home.aroundYou')}
          titleSize="h1"
        />
      </View>
    </View>
  );
}

export type FeedListProps = {
  activeCount: number;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  location: UserLocation;
  measured: boolean;
  selectedEquipment: readonly string[];
  spots: Spot[];
  onAddSpot: () => void;
  onClearFilters: () => void;
  onOpenFilters: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  onToggleEquipment: (name: string) => void;
  renderSpot: ListRenderItem<Spot>;
};

/** The feed list with its header, empty states and pull-to-refresh, apart from the screen's data. */
export function FeedList({
  activeCount,
  isError,
  isFetching,
  isLoading,
  location,
  measured,
  selectedEquipment,
  spots,
  onAddSpot,
  onClearFilters,
  onOpenFilters,
  onOpenSearch,
  onRefresh,
  onRetry,
  onToggleEquipment,
  renderSpot,
}: FeedListProps) {
  const scheme = useScheme();

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-section-gap-lg"
      data={spots}
      initialNumToRender={4}
      ItemSeparatorComponent={SpotCardSeparator}
      keyExtractor={(spot) => spot.id}
      ListEmptyComponent={
        <View className="px-screen-px">
          <FeedEmptyState
            hasFilters={activeCount > 0}
            isError={isError}
            isLoading={isLoading}
            measured={measured}
            onAddSpot={onAddSpot}
            onClearFilters={onClearFilters}
            onRetry={onRetry}
            onSearchElsewhere={onOpenSearch}
          />
        </View>
      }
      ListHeaderComponent={
        <FeedHeader
          filterCount={activeCount}
          location={location}
          onClearEquipment={onClearFilters}
          onOpenFilters={onOpenFilters}
          onOpenSearch={onOpenSearch}
          onToggleEquipment={onToggleEquipment}
          selectedEquipment={selectedEquipment}
        />
      }
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={isFetching}
          tintColor={schemeTextMuted[scheme]}
        />
      }
      renderItem={renderSpot}
    />
  );
}
