import { SectionHeader } from '@/components';
import { EquipmentQuantityGrid } from '@/features/spot-editor/EquipmentQuantityGrid';
import { StepScrollView } from '@/features/spot-editor/StepScrollView';
import type { EquipmentDraftItem } from '@/features/spot-editor/types';

export type AddSpotEquipmentStepProps = {
  equipment: readonly EquipmentDraftItem[];
  errorText?: string;
  onChangeEquipment: (equipment: readonly EquipmentDraftItem[]) => void;
};

/** Step 3: which equipment stands at the spot, and how many of each. */
export function AddSpotEquipmentStep({
  equipment,
  errorText,
  onChangeEquipment,
}: AddSpotEquipmentStepProps) {
  return (
    <StepScrollView>
      <SectionHeader title="What equipment is there?" titleSize="h1" />

      <EquipmentQuantityGrid errorText={errorText} onChange={onChangeEquipment} value={equipment} />
    </StepScrollView>
  );
}
