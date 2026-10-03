import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { BrandLogo, GhostButton, SecondaryButton, SectionHeader } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { LocationPrompt } from '@/features/location/LocationPrompt';
import type { UserLocation } from '@/features/location/useUserLocation';
import { EquipmentFilterChips } from '@/features/spots/equipment-filters';
import { SpotsSearchBar } from '@/features/spots/SpotsSearchBar';
import type { FeedScope } from '@/features/spots/useSpotsQuery';
import { t } from '@/i18n';

export type FeedHeaderProps = {
  filterCount: number;
  location: UserLocation;
  scope: FeedScope;
  selectedEquipment: readonly string[];
  onClearEquipment: () => void;
  onOpenFilters: () => void;
  onOpenSearch: () => void;
  onToggleEquipment: (name: string) => void;
  onToggleScope: () => void;
};

/**
 * The feed's top matter: brand, search and the equipment row, the location ask, the switch between
 * the nearby list and the whole directory, and the section heading the switch belongs to.
 *
 * The switch shares the search row rather than sitting on its own: searching and choosing which
 * spots are in the list are the same kind of control, and the row already exists, so the switch
 * costs no extra height. The heading's action slot is not an option — the filter button owns it,
 * and a second labelled button beside it would squeeze the title on a 360 dp screen. The switch
 * only appears when a position exists: without one the list is already the directory, and the
 * location prompt beside it is what explains that.
 */
export function FeedHeader({
  filterCount,
  location,
  scope,
  selectedEquipment,
  onClearEquipment,
  onOpenFilters,
  onOpenSearch,
  onToggleEquipment,
  onToggleScope,
}: FeedHeaderProps) {
  const browsingAll = scope === 'all';
  const canBrowseNearby = location.coordinate !== null;

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

          {canBrowseNearby ? (
            <GhostButton
              label={browsingAll ? t('home.seeNearby') : t('home.seeAll')}
              onPress={onToggleScope}
              size="sm"
            />
          ) : null}
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
          }
          title={browsingAll ? t('home.allSpots') : t('home.aroundYou')}
          titleIcon={
            browsingAll ? undefined : (
              <View accessible accessibilityLabel={t('home.sortedByDistance')}>
                <Ionicons color={brandColors.primary} name="location" size={iconSizeValues.md} />
              </View>
            )
          }
          titleSize="h1"
        />
      </View>
    </View>
  );
}
