import { Image, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  DangerButton,
  GhostButton,
  IconButton,
  Modal,
  PrimaryButton,
  ScreenShell,
  SectionHeader,
  TextArea,
  TextInput,
} from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import type { Spot } from '@/features/spots/types';
import { ConditionSelector } from '@/features/spot-editor/ConditionSelector';
import { EquipmentQuantityGrid } from '@/features/spot-editor/EquipmentQuantityGrid';
import { PhotoManager } from '@/features/spot-editor/PhotoManager';
import { useEditSpotDraft } from '@/features/spot-editor/useEditSpotDraft';
import {
  SPOT_DESCRIPTION_MAX_LENGTH,
  SPOT_NAME_MAX_LENGTH,
} from '@/features/spot-editor/validation';
import { useScheme } from '@/hooks/useScheme';

export type EditSpotFormProps = {
  spot: Spot;
};

type EditSpotHeaderProps = {
  onCancel: () => void;
};

function EditSpotHeader({ onCancel }: EditSpotHeaderProps) {
  const scheme = useScheme();

  return (
    <View className="flex-row items-center gap-space-8">
      <IconButton
        accessibilityLabel="Back"
        icon={
          <Ionicons
            color={schemeTextPrimary[scheme]}
            name="chevron-back"
            size={iconSizeValues.md}
          />
        }
        onPress={onCancel}
        variant="surface"
      />

      <Text className="flex-1 font-semibold text-h2 text-text-primary">Edit Spot</Text>

      <GhostButton label="Cancel" onPress={onCancel} size="sm" />
    </View>
  );
}

type EditSpotDialogsProps = {
  discardVisible: boolean;
  savedVisible: boolean;
  onCancelDiscard: () => void;
  onConfirmDiscard: () => void;
  onSavedDone: () => void;
};

function EditSpotDialogs({
  discardVisible,
  savedVisible,
  onCancelDiscard,
  onConfirmDiscard,
  onSavedDone,
}: EditSpotDialogsProps) {
  return (
    <>
      <Modal
        actions={
          <>
            <GhostButton label="Keep editing" onPress={onCancelDiscard} />
            <DangerButton label="Discard" onPress={onConfirmDiscard} />
          </>
        }
        description="Your edits to this spot will be lost."
        onClose={onCancelDiscard}
        title="Discard changes?"
        visible={discardVisible}
      />

      <Modal
        actions={<PrimaryButton label="Done" onPress={onSavedDone} />}
        description="Your changes to this spot are saved."
        onClose={onSavedDone}
        title="Changes saved"
        visible={savedVisible}
      />
    </>
  );
}

/**
 * The Edit Spot form: the spot's photo, then its name, description, equipment, condition and
 * photos as structured, validated sections with one Save action.
 */
export function EditSpotForm({ spot }: EditSpotFormProps) {
  const {
    cancelDiscard,
    changeCondition,
    changeDescription,
    changeEquipment,
    changeName,
    changePhotos,
    condition,
    confirmDiscard,
    description,
    discardVisible,
    equipment,
    errors,
    handleSave,
    handleSavedDone,
    name,
    photos,
    requestClose,
    savedVisible,
    saving,
  } = useEditSpotDraft(spot);

  const cover = photos[0];

  return (
    <>
      <ScreenShell header={false} scroll>
        <EditSpotHeader onCancel={requestClose} />

        {cover === undefined ? null : (
          <Image
            accessibilityLabel={`${name} cover photo`}
            className="h-spot-image w-full rounded-lg bg-bg-surface"
            source={cover}
          />
        )}

        <View className="gap-space-12">
          <TextInput
            errorText={errors.name}
            label="Name"
            maxLength={SPOT_NAME_MAX_LENGTH}
            onChangeText={changeName}
            placeholder="e.g. Trakia Fitness Park"
            value={name}
          />

          <TextArea
            errorText={errors.description}
            label="Description"
            maxLength={SPOT_DESCRIPTION_MAX_LENGTH}
            onChangeText={changeDescription}
            placeholder="What should athletes know about this spot?"
            showCount
            value={description}
          />
        </View>

        <View className="gap-space-12">
          <SectionHeader accent title="Equipment" />
          <EquipmentQuantityGrid
            errorText={errors.equipment}
            onChange={changeEquipment}
            value={equipment}
          />
        </View>

        <View className="gap-space-12">
          <SectionHeader accent title="Condition" />
          <ConditionSelector onChange={changeCondition} value={condition} />
        </View>

        <View className="gap-space-12">
          <SectionHeader accent title="Photos" />
          <PhotoManager errorText={errors.photos} onChange={changePhotos} photos={photos} />
        </View>

        <PrimaryButton fullWidth label="Save Changes" loading={saving} onPress={handleSave} />
      </ScreenShell>

      <EditSpotDialogs
        discardVisible={discardVisible}
        onCancelDiscard={cancelDiscard}
        onConfirmDiscard={confirmDiscard}
        onSavedDone={handleSavedDone}
        savedVisible={savedVisible}
      />
    </>
  );
}
