import { Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { PhotoGrid, SecondaryButton } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { SPOT_PHOTO } from '@/features/spots/spot-photos';
import { cn } from '@/utils/cn';

/** The most photos one spot can carry in the mock editors. */
export const MAX_SPOT_PHOTOS = 4;

export type PhotoManagerProps = {
  photos: readonly ImageSourcePropType[];
  onChange: (photos: readonly ImageSourcePropType[]) => void;
  errorText?: string;
  className?: string;
};

/**
 * A spot's photo collection while it is being written: previews with remove affordances and
 * an add action.
 *
 * Add Photo attaches the bundled placeholder rather than opening a picker, so previews and
 * removal work end to end before the storage layer exists.
 */
export function PhotoManager({ photos, onChange, errorText, className }: PhotoManagerProps) {
  const atLimit = photos.length >= MAX_SPOT_PHOTOS;

  const addPhoto = () => {
    onChange([...photos, SPOT_PHOTO]);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <View className={cn('gap-space-12', className)}>
      {photos.length === 0 ? null : (
        <PhotoGrid
          onRemovePhoto={removePhoto}
          photos={photos.map((uri, index) => ({
            accessibilityLabel: `Spot photo ${index + 1}`,
            uri,
          }))}
        />
      )}

      <SecondaryButton
        disabled={atLimit}
        fullWidth
        label="Add Photo"
        leftIcon={<Ionicons color={brandColors.primary} name="add" size={iconSizeValues.sm} />}
        onPress={addPhoto}
      />

      {errorText !== undefined ? (
        <Text className="text-caption text-status-bad">{errorText}</Text>
      ) : (
        <Text className="text-caption text-text-muted">{`Up to ${MAX_SPOT_PHOTOS} photos.`}</Text>
      )}
    </View>
  );
}
