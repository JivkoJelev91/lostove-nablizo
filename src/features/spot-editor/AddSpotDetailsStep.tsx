import { SectionHeader, TextArea, TextInput } from '@/components';
import { StepScrollView } from '@/features/spot-editor/StepScrollView';
import type { SpotDraftErrors } from '@/features/spot-editor/types';
import {
  SPOT_DESCRIPTION_MAX_LENGTH,
  SPOT_NAME_MAX_LENGTH,
} from '@/features/spot-editor/validation';

export type AddSpotDetailsStepProps = {
  name: string;
  description: string;
  errors: SpotDraftErrors;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
};

/** Step 2: the spot's name and its description. */
export function AddSpotDetailsStep({
  name,
  description,
  errors,
  onChangeName,
  onChangeDescription,
}: AddSpotDetailsStepProps) {
  return (
    <StepScrollView>
      <SectionHeader title="Tell us about this spot" titleSize="h1" />

      <TextInput
        errorText={errors.name}
        label="Name"
        maxLength={SPOT_NAME_MAX_LENGTH}
        onChangeText={onChangeName}
        placeholder="e.g. Trakia Fitness Park"
        value={name}
      />

      <TextArea
        errorText={errors.description}
        label="Description"
        maxLength={SPOT_DESCRIPTION_MAX_LENGTH}
        onChangeText={onChangeDescription}
        placeholder="Outdoor fitness area with pull-up bars, dip bars and rings..."
        showCount
        value={description}
      />
    </StepScrollView>
  );
}
