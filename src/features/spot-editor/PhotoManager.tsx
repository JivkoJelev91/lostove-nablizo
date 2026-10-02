import { useState } from 'react';
import { Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { PhotoGrid, SecondaryButton } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { usePhotoPicker } from '@/features/spot-editor/usePhotoPicker';
import type { PhotoPickResult } from '@/features/spot-editor/usePhotoPicker';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

/** The most photos one spot can carry. */
export const MAX_SPOT_PHOTOS = 4;

export type PhotoManagerProps = {
  photos: readonly ImageSourcePropType[];
  onChange: (photos: readonly ImageSourcePropType[]) => void;
  errorText?: string;
  className?: string;
};

/**
 * A spot's photo collection while it is being written: previews with remove affordances, and
 * camera and gallery actions to add more.
 *
 * A picker failure, including a denied camera permission, is shown in the same place validation
 * messages appear, so the athlete always gets a reason where they were looking.
 */
export function PhotoManager({ photos, onChange, errorText, className }: PhotoManagerProps) {
  const { busy, pickFromLibrary, takePhoto } = usePhotoPicker();
  const [pickerError, setPickerError] = useState<string | undefined>(undefined);
  const atLimit = photos.length >= MAX_SPOT_PHOTOS;
  const remaining = MAX_SPOT_PHOTOS - photos.length;
  const displayedError = pickerError ?? errorText;

  const handleResult = (result: PhotoPickResult) => {
    switch (result.status) {
      case 'picked':
        if (result.photos.length > 0) {
          onChange([...photos, ...result.photos]);
        }

        setPickerError(result.failed > 0 ? t('photosStep.pickerFailed') : undefined);
        break;
      case 'denied':
        setPickerError(t('photosStep.cameraDenied'));
        break;
      case 'failed':
        setPickerError(t('photosStep.pickerFailed'));
        break;
      case 'canceled':
        break;
    }
  };

  const handleTakePhoto = async () => {
    handleResult(await takePhoto());
  };

  const handlePickFromLibrary = async () => {
    handleResult(await pickFromLibrary(remaining));
  };

  const removePhoto = (index: number) => {
    setPickerError(undefined);
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <View className={cn('gap-space-12', className)}>
      {photos.length === 0 ? null : (
        <PhotoGrid
          onRemovePhoto={removePhoto}
          photos={photos.map((uri, index) => ({
            accessibilityLabel: t('photosStep.label', { index: index + 1 }),
            uri,
          }))}
        />
      )}

      <View className="flex-row gap-space-8">
        <View className="flex-1">
          <SecondaryButton
            disabled={atLimit || busy !== null}
            fullWidth
            label={t('photosStep.camera')}
            leftIcon={
              <Ionicons
                color={brandColors.primary}
                name="camera-outline"
                size={iconSizeValues.sm}
              />
            }
            loading={busy === 'camera'}
            onPress={handleTakePhoto}
          />
        </View>

        <View className="flex-1">
          <SecondaryButton
            disabled={atLimit || busy !== null}
            fullWidth
            label={t('photosStep.gallery')}
            leftIcon={
              <Ionicons
                color={brandColors.primary}
                name="images-outline"
                size={iconSizeValues.sm}
              />
            }
            loading={busy === 'library'}
            onPress={handlePickFromLibrary}
          />
        </View>
      </View>

      {displayedError !== undefined ? (
        <Text className="text-caption text-status-bad">{displayedError}</Text>
      ) : (
        <Text className="text-caption text-text-muted">
          {t('photosStep.limit', { count: MAX_SPOT_PHOTOS })}
        </Text>
      )}
    </View>
  );
}
