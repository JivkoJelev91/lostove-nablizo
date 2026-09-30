import { Ionicons } from '@expo/vector-icons';

import {
  Chip,
  DipBarsIcon,
  EquipmentChip,
  FilterChip,
  PullUpBarIcon,
  RingsIcon,
  StatusChip,
} from '@/components';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';
import { brandColors, iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export default function ChipsGalleryScreen() {
  const scheme = useScheme();

  return (
    <GalleryScreen
      description="Pill tags for filters, equipment and status, 36px tall."
      title="Chips"
    >
      <GalleryGroup title="Filter chip">
        <GalleryRow label="Inactive and active">
          <FilterChip label="All" onPress={() => {}} />
          <FilterChip label="Bars" onPress={() => {}} />
          <FilterChip label="Rings" onPress={() => {}} />
          <FilterChip label="Calisthenics" onPress={() => {}} selected />
        </GalleryRow>

        <GalleryRow label="With an icon, and disabled">
          <FilterChip
            leftIcon={
              <Ionicons color={brandColors.primary} name="funnel" size={iconSizeValues.xs} />
            }
            label="Filtered"
            onPress={() => {}}
          />
          <FilterChip disabled label="Coming soon" onPress={() => {}} />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Equipment chip">
        <GalleryRow label="Name, icon and quantity">
          <EquipmentChip icon={<PullUpBarIcon />} label="Pull-up" quantity={2} />
          <EquipmentChip icon={<RingsIcon />} label="Rings" />
          <EquipmentChip icon={<DipBarsIcon />} label="Dips" quantity={2} />
        </GalleryRow>

        <GalleryRow label="Selectable and disabled">
          <EquipmentChip label="Bars" onPress={() => {}} quantity={1} selected />
          <EquipmentChip disabled label="Legacy" quantity={1} />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Status chip">
        <GalleryRow label="Tones">
          <StatusChip
            icon={
              <Ionicons
                color={brandColors.primary}
                name="checkmark-circle"
                size={iconSizeValues.xs}
              />
            }
            label="Verified"
            tone="good"
          />
          <StatusChip label="Needs check" tone="warning" />
          <StatusChip label="Closed" tone="bad" />
          <StatusChip label="Draft" tone="neutral" />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Chip">
        <GalleryRow label="Static tag">
          <Chip label="Outdoors" />
          <Chip
            leftIcon={
              <Ionicons
                color={schemeTextPrimary[scheme]}
                name="location"
                size={iconSizeValues.xs}
              />
            }
            label="Sofia"
          />
        </GalleryRow>
      </GalleryGroup>
    </GalleryScreen>
  );
}
