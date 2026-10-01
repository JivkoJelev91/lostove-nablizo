import { View } from 'react-native';

import { LoadingSpinner, PrimaryButton, Screen } from '@/components';
import { AddSpotHeader } from '@/features/spot-editor/AddSpotHeader';
import { AddSpotStepContent } from '@/features/spot-editor/AddSpotStepContent';
import { AddSpotSuccess } from '@/features/spot-editor/AddSpotSuccess';
import { useAddSpotFlow } from '@/features/spot-editor/useAddSpotFlow';

/**
 * The five-step Add Spot flow: where the spot is, what it is, what it carries, what it looks
 * like, and a review before the mock submit.
 */
export function AddSpotFlow() {
  const {
    changeCoordinate,
    changeDescription,
    changeEquipment,
    changeName,
    changePhotos,
    createdSpot,
    draft,
    errors,
    handleBack,
    handleContinue,
    handleSubmit,
    handleViewSpot,
    isLastStep,
    reset,
    step,
    submitted,
    submitting,
  } = useAddSpotFlow();

  if (submitted && createdSpot !== null) {
    return (
      <AddSpotSuccess
        onAddAnother={reset}
        onViewSpot={handleViewSpot}
        spotName={createdSpot.name}
      />
    );
  }

  return (
    <Screen edges={['top']} padded={false}>
      <View className="flex-1">
        <AddSpotHeader onBack={handleBack} step={step} />

        <View className="flex-1">
          <AddSpotStepContent
            draft={draft}
            errors={errors}
            onChangeCoordinate={changeCoordinate}
            onChangeDescription={changeDescription}
            onChangeEquipment={changeEquipment}
            onChangeName={changeName}
            onChangePhotos={changePhotos}
            step={step}
          />
        </View>

        <View className="px-screen-px pb-space-16 pt-space-12">
          {isLastStep ? (
            <PrimaryButton fullWidth label="Add Spot" loading={submitting} onPress={handleSubmit} />
          ) : (
            <PrimaryButton fullWidth label="Continue" onPress={handleContinue} />
          )}
        </View>
      </View>

      {submitting ? (
        <View className="absolute inset-0 items-center justify-center bg-scrim">
          <View className="rounded-xl bg-surface-card-elevated p-card-pad shadow-card-elevated">
            <LoadingSpinner label="Adding your spot..." />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
