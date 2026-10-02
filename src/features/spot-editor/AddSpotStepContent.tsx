import type { DraftPhoto } from '@/features/photos/types';
import type { Coordinate } from '@/features/spots/types';
import { AddSpotDetailsStep } from '@/features/spot-editor/AddSpotDetailsStep';
import { AddSpotEquipmentStep } from '@/features/spot-editor/AddSpotEquipmentStep';
import { AddSpotLocationStep } from '@/features/spot-editor/AddSpotLocationStep';
import { AddSpotPhotosStep } from '@/features/spot-editor/AddSpotPhotosStep';
import { AddSpotReviewStep } from '@/features/spot-editor/AddSpotReviewStep';
import type {
  AddSpotStep,
  EquipmentDraftItem,
  SpotDraft,
  SpotDraftErrors,
} from '@/features/spot-editor/types';

export type AddSpotStepContentProps = {
  step: AddSpotStep;
  draft: SpotDraft;
  errors: SpotDraftErrors;
  onChangeCoordinate: (coordinate: Coordinate) => void;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onChangeEquipment: (equipment: readonly EquipmentDraftItem[]) => void;
  onChangePhotos: (photos: readonly DraftPhoto[]) => void;
};

/** Picks the step the wizard is currently on. Steps keep their own layout and validation. */
export function AddSpotStepContent({
  step,
  draft,
  errors,
  onChangeCoordinate,
  onChangeName,
  onChangeDescription,
  onChangeEquipment,
  onChangePhotos,
}: AddSpotStepContentProps) {
  switch (step) {
    case 1:
      return (
        <AddSpotLocationStep
          coordinate={draft.coordinate}
          errorText={errors.location}
          onChangeCoordinate={onChangeCoordinate}
        />
      );
    case 2:
      return (
        <AddSpotDetailsStep
          description={draft.description}
          errors={errors}
          name={draft.name}
          onChangeDescription={onChangeDescription}
          onChangeName={onChangeName}
        />
      );
    case 3:
      return (
        <AddSpotEquipmentStep
          equipment={draft.equipment}
          errorText={errors.equipment}
          onChangeEquipment={onChangeEquipment}
        />
      );
    case 4:
      return (
        <AddSpotPhotosStep
          errorText={errors.photos}
          onChangePhotos={onChangePhotos}
          photos={draft.photos}
        />
      );
    case 5:
      return <AddSpotReviewStep draft={draft} />;
  }
}
