import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Avatar, Divider, GhostButton, Rating, SectionHeader } from '@/components';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';
import { brandColors, iconSizeValues, statusColors } from '@/constants/design-tokens';

const AVATAR_PHOTO = require('@/assets/images/icon.png') as number;

export default function DataGalleryScreen() {
  return (
    <GalleryScreen
      description="Ratings, avatars, dividers and the section header with its 8–12px content gap."
      title="Data display"
    >
      <GalleryGroup title="Rating">
        <GalleryRow label="Sizes">
          <Rating count={126} size="sm" value={4.7} />
          <Rating count={126} size="md" value={4.7} />
          <Rating count={126} size="lg" value={4.7} />
        </GalleryRow>

        <GalleryRow label="Without a value or count">
          <Rating showValue={false} size="sm" value={3} />
          <Rating size="md" value={5} />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Avatar">
        <GalleryRow label="Sizes and fallbacks">
          <Avatar name="Alex Petrov" size="sm" />
          <Avatar name="Maria Georgieva" size="md" />
          <Avatar name="Jordan Lee" size="lg" />
          <Avatar name="No Image" size="lg" uri={AVATAR_PHOTO} />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Section header">
        <View className="gap-space-12">
          <SectionHeader
            action={
              <GhostButton
                label="See all"
                leftIcon={
                  <Ionicons
                    color={brandColors.primary}
                    name="chevron-forward"
                    size={iconSizeValues.xs}
                  />
                }
                onPress={() => {}}
                size="sm"
              />
            }
            description="A short line of context under the title."
            title="Nearby spots"
          />
          <Divider />
          <View className="h-2 w-40 rounded-pill bg-bg-surface" />
        </View>
      </GalleryGroup>

      <GalleryGroup title="Divider">
        <View className="gap-space-8">
          <View className="h-2 w-24 rounded-pill bg-bg-surface" />
          <Divider />
          <View className="h-2 w-40 rounded-pill bg-bg-surface" />
        </View>
      </GalleryGroup>

      <GalleryGroup title="Status colours">
        <GalleryRow label="Tokens">
          <View className="flex-row items-center gap-space-4">
            <View className="h-3 w-3 rounded-pill" style={{ backgroundColor: statusColors.good }} />
            <View
              className="h-3 w-3 rounded-pill"
              style={{ backgroundColor: statusColors.warning }}
            />
            <View className="h-3 w-3 rounded-pill" style={{ backgroundColor: statusColors.bad }} />
            <View
              className="h-3 w-3 rounded-pill"
              style={{ backgroundColor: brandColors.primary }}
            />
          </View>
        </GalleryRow>
      </GalleryGroup>
    </GalleryScreen>
  );
}
