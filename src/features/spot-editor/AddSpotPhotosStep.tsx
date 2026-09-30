import type { ImageSourcePropType } from 'react-native';

import { SectionHeader } from '@/components';
import { PhotoManager } from '@/features/spot-editor/PhotoManager';
import { StepScrollView } from '@/features/spot-editor/StepScrollView';

export type AddSpotPhotosStepProps = {
  photos: readonly ImageSourcePropType[];
  errorText?: string;
  onChangePhotos: (photos: readonly ImageSourcePropType[]) => void;
};

/** Step 4: the spot's photos, previewed with remove actions before anything is submitted. */
export function AddSpotPhotosStep({ photos, errorText, onChangePhotos }: AddSpotPhotosStepProps) {
  return (
    <StepScrollView>
      <SectionHeader
        description="Show people what the spot actually looks like."
        title="Add photos"
        titleSize="h1"
      />

      <PhotoManager errorText={errorText} onChange={onChangePhotos} photos={photos} />
    </StepScrollView>
  );
}
