import { View } from 'react-native';

import {
  DipBarsIcon,
  EquipmentList,
  PhotoGrid,
  PullUpBarIcon,
  RingsIcon,
  StatusChip,
  VerificationBadge,
} from '@/components';
import type { EquipmentListItem, PhotoGridItem } from '@/components';
import { iconSizeValues } from '@/constants/design-tokens';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';
import { SPOT_PHOTO } from '@/features/spots/spot-photos';
import { daysAgo } from '@/utils/dates';

const PHOTOS: PhotoGridItem[] = [
  { uri: SPOT_PHOTO, accessibilityLabel: 'Spot photo 1' },
  { uri: SPOT_PHOTO, accessibilityLabel: 'Spot photo 2' },
  { uri: SPOT_PHOTO, accessibilityLabel: 'Spot photo 3' },
  { uri: SPOT_PHOTO, accessibilityLabel: 'Spot photo 4' },
];

// The equipment tile's own token asks for a 24pt icon, larger than the 16pt the chips use.
const EQUIPMENT: EquipmentListItem[] = [
  {
    name: 'Pull-up',
    quantity: 2,
    condition: 'good',
    icon: <PullUpBarIcon size={iconSizeValues.md} />,
  },
  { name: 'Rings', condition: 'worn', icon: <RingsIcon size={iconSizeValues.md} /> },
  { name: 'Dips', quantity: 2, condition: 'good', icon: <DipBarsIcon size={iconSizeValues.md} /> },
  { name: 'Monkey bars', condition: 'damaged' },
];

export default function SpotDetailsGalleryScreen() {
  return (
    <GalleryScreen
      description="The pieces a spot page is built from: photos, what the spot has, and whether it was checked recently."
      title="Spot details"
    >
      <GalleryGroup title="Photo grid">
        <GalleryRow label="Two columns, pressable and removable" stack>
          <PhotoGrid photos={PHOTOS} onPressPhoto={() => {}} onRemovePhoto={() => {}} />
        </GalleryRow>

        <GalleryRow label="Three columns, an odd count keeps the columns aligned" stack>
          <PhotoGrid columns={3} photos={PHOTOS.slice(0, 3)} />
        </GalleryRow>

        <GalleryRow label="Loading" stack>
          <PhotoGrid loading photos={PHOTOS.slice(0, 2)} />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Equipment list">
        <GalleryRow label="Type, quantity and condition" stack>
          <EquipmentList items={EQUIPMENT} />
        </GalleryRow>

        <GalleryRow label="Pressable, reports the index tapped" stack>
          <EquipmentList items={EQUIPMENT} onPressItem={() => {}} />
        </GalleryRow>

        <GalleryRow label="Condition key (the tile dot)">
          <StatusChip label="Good" tone="good" />
          <StatusChip label="Worn" tone="warning" />
          <StatusChip label="Damaged" tone="bad" />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Verification">
        <GalleryRow label="The date drives the wording and the colour" stack>
          <View className="flex-row flex-wrap items-center gap-space-8">
            <VerificationBadge verifiedAt={daysAgo(0)} />
            <VerificationBadge verifiedAt={daysAgo(4)} />
            <VerificationBadge verifiedAt={daysAgo(20)} />
            <VerificationBadge verifiedAt={daysAgo(70)} />
            <VerificationBadge verifiedAt={daysAgo(400)} />
          </View>
        </GalleryRow>
      </GalleryGroup>
    </GalleryScreen>
  );
}
