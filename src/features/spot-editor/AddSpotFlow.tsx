import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { LoadingSpinner, PrimaryButton, Screen } from '@/components';
import { AddSpotHeader } from '@/features/spot-editor/AddSpotHeader';
import { AddSpotStepContent } from '@/features/spot-editor/AddSpotStepContent';
import { AddSpotSuccess } from '@/features/spot-editor/AddSpotSuccess';
import { useAddSpotFlow } from '@/features/spot-editor/useAddSpotFlow';
import { t } from '@/i18n';

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
    photoFailures,
    reset,
    step,
    submitError,
    submitted,
    submitting,
    uploadProgress,
  } = useAddSpotFlow();

  if (submitted && createdSpot !== null) {
    return (
      <AddSpotSuccess
        onAddAnother={reset}
        onViewSpot={handleViewSpot}
        photoFailures={photoFailures}
        spotName={createdSpot.name}
      />
    );
  }

  return (
    <Screen edges={['top']} padded={false}>
      {/* The action bar is a sibling of the step's scroll view, so the step's own keyboard insets
          never lift it: on iOS the keyboard covered Continue while the athlete typed. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
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

        <View className="gap-space-8 px-screen-px pb-space-16 pt-space-12">
          {submitError === undefined ? null : (
            <Text className="font-medium text-caption text-status-bad">
              {t('submit.addFailed')}
            </Text>
          )}

          {isLastStep ? (
            <PrimaryButton
              fullWidth
              label={t('submit.add')}
              loading={submitting}
              onPress={handleSubmit}
            />
          ) : (
            <PrimaryButton fullWidth label={t('common.continue')} onPress={handleContinue} />
          )}
        </View>
      </KeyboardAvoidingView>

      {submitting ? (
        <Animated.View
          className="absolute inset-0 items-center justify-center bg-scrim"
          entering={FadeIn.duration(150).reduceMotion(ReduceMotion.System)}
        >
          <View className="rounded-xl bg-surface-card-elevated p-card-pad shadow-card-elevated">
            <LoadingSpinner
              label={
                uploadProgress === null
                  ? t('submit.submitting')
                  : t('submit.uploading', {
                      done: uploadProgress.completed,
                      total: uploadProgress.total,
                    })
              }
            />
          </View>
        </Animated.View>
      ) : null}
    </Screen>
  );
}
