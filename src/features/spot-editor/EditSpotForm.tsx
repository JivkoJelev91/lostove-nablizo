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
import { SpotStatusNotice } from '@/features/spots/SpotStatusNotice';
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
import { t } from '@/i18n';

export type EditSpotFormProps = {
  spot: Spot;
  /**
   * True when a moderator is editing somebody else's spot: every stored photo is then part of the
   * draft, not only the athlete's own, because the moderator is fixing the whole listing.
   */
  moderating?: boolean;
};

type EditSpotHeaderProps = {
  onCancel: () => void;
};

function EditSpotHeader({ onCancel }: EditSpotHeaderProps) {
  const scheme = useScheme();

  return (
    <View className="flex-row items-center gap-space-8">
      <IconButton
        accessibilityLabel={t('common.back')}
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

      <Text className="flex-1 font-semibold text-h2 text-text-primary">
        {t('submit.editTitle')}
      </Text>

      <GhostButton label={t('common.cancel')} onPress={onCancel} size="sm" />
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
            <GhostButton label={t('submit.keepEditing')} onPress={onCancelDiscard} />
            <DangerButton label={t('submit.discard')} onPress={onConfirmDiscard} />
          </>
        }
        description={t('submit.discardDescription')}
        onClose={onCancelDiscard}
        title={t('submit.discardTitle')}
        visible={discardVisible}
      />

      <Modal
        actions={<PrimaryButton label={t('common.done')} onPress={onSavedDone} />}
        description={t('submit.changesDescription')}
        onClose={onSavedDone}
        title={t('submit.changesTitle')}
        visible={savedVisible}
      />
    </>
  );
}

/**
 * The Edit Spot form: the spot's photo, then its name, description, equipment, condition and
 * photos as structured, validated sections with one Save action.
 */
export function EditSpotForm({ spot, moderating = false }: EditSpotFormProps) {
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
    saveError,
    savedVisible,
    saving,
  } = useEditSpotDraft(spot, moderating);

  const cover = photos[0];

  return (
    <>
      <ScreenShell header={false} scroll>
        <EditSpotHeader onCancel={requestClose} />

        <SpotStatusNotice context="editing" status={spot.status} />

        {cover === undefined ? null : (
          <Image
            accessibilityLabel={t('photosStep.coverPhoto', { name })}
            className="h-spot-image w-full rounded-lg bg-bg-surface"
            source={{ uri: cover.uri }}
          />
        )}

        <View className="gap-space-12">
          <TextInput
            errorText={errors.name}
            label={t('details.name')}
            maxLength={SPOT_NAME_MAX_LENGTH}
            onChangeText={changeName}
            placeholder={t('details.namePlaceholder')}
            value={name}
          />

          <TextArea
            errorText={errors.description}
            label={t('details.description')}
            maxLength={SPOT_DESCRIPTION_MAX_LENGTH}
            onChangeText={changeDescription}
            placeholder={t('details.descriptionPlaceholder')}
            showCount
            value={description}
          />
        </View>

        <View className="gap-space-12">
          <SectionHeader accent title={t('spot.equipment')} />
          <EquipmentQuantityGrid
            errorText={errors.equipment}
            onChange={changeEquipment}
            value={equipment}
          />
        </View>

        <View className="gap-space-12">
          <SectionHeader accent title={t('condition.title')} />
          <ConditionSelector onChange={changeCondition} value={condition} />
        </View>

        <View className="gap-space-12">
          <SectionHeader accent title={t('photosStep.section')} />
          <PhotoManager errorText={errors.photos} onChange={changePhotos} photos={photos} />
        </View>

        <View className="gap-space-8">
          {saveError === undefined ? null : (
            <Text className="font-medium text-caption text-status-bad">{t(saveError)}</Text>
          )}

          <PrimaryButton
            fullWidth
            label={t('submit.changes')}
            loading={saving}
            onPress={handleSave}
          />
        </View>
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
