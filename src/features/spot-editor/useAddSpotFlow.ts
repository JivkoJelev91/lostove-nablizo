import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import type { Coordinate } from '@/features/spots/types';
import type { AddSpotStep, SpotDraft, SpotDraftErrors } from '@/features/spot-editor/types';
import {
  firstInvalidStep,
  hasErrors,
  validateDraft,
  validateStep,
} from '@/features/spot-editor/validation';

/** The draft with nothing filled in: step 1 captures the coordinate before anything else. */
const EMPTY_DRAFT: SpotDraft = {
  coordinate: null,
  name: '',
  description: '',
  equipment: [],
  photos: [],
};

const LAST_STEP: AddSpotStep = 5;

const NEXT_STEP: Record<AddSpotStep, AddSpotStep> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 5 };
const PREVIOUS_STEP: Record<AddSpotStep, AddSpotStep> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 4 };

/** How long the mock submit spends "saving" before the success state appears. */
const SUBMIT_DELAY_MS = 1200;

/**
 * The Add Spot wizard's state: the draft, the current step, validation errors, and the mock
 * submit lifecycle.
 *
 * No backend exists yet, so submitting waits {@link SUBMIT_DELAY_MS} and then shows the
 * success state. Everything the flow needs to decide — including where Android's back
 * gesture goes — lives here, leaving the screen to lay out what it returns.
 */
export function useAddSpotFlow() {
  const [step, setStep] = useState<AddSpotStep>(1);
  const [draft, setDraft] = useState<SpotDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<SpotDraftErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  const reset = useCallback(() => {
    setStep(1);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitting(false);
    setSubmitted(false);
    submittedRef.current = false;
  }, []);

  useEffect(() => {
    if (!submitting) {
      return;
    }

    const timeout = setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      submittedRef.current = true;
    }, SUBMIT_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [submitting]);

  // Coming back to the tab after a finished flow should greet the user with a fresh form.
  useFocusEffect(
    useCallback(() => {
      if (submittedRef.current) {
        reset();
      }
    }, [reset]),
  );

  // Android's back gesture walks the wizard backwards before it leaves the tab. Once the spot
  // is submitted the wizard has nothing left to walk: the success screen is the end of the
  // flow, so back falls through and leaves the tab like it would anywhere else.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (submitted || step === 1) {
          return false;
        }

        setStep(PREVIOUS_STEP[step]);
        return true;
      });

      return () => subscription.remove();
    }, [step, submitted]),
  );

  const changeName = useCallback((name: string) => {
    setDraft((current) => ({ ...current, name }));
    setErrors((current) => ({ ...current, name: undefined }));
  }, []);

  const changeDescription = useCallback((description: string) => {
    setDraft((current) => ({ ...current, description }));
    setErrors((current) => ({ ...current, description: undefined }));
  }, []);

  const changeCoordinate = useCallback((coordinate: Coordinate) => {
    setDraft((current) => ({ ...current, coordinate }));
    setErrors((current) => ({ ...current, location: undefined }));
  }, []);

  const changeEquipment = useCallback((equipment: SpotDraft['equipment']) => {
    setDraft((current) => ({ ...current, equipment }));
    setErrors((current) => ({ ...current, equipment: undefined }));
  }, []);

  const changePhotos = useCallback((photos: SpotDraft['photos']) => {
    setDraft((current) => ({ ...current, photos }));
    setErrors((current) => ({ ...current, photos: undefined }));
  }, []);

  const handleContinue = useCallback(() => {
    const stepErrors = validateStep(step, draft);

    if (hasErrors(stepErrors)) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setStep(NEXT_STEP[step]);
  }, [draft, step]);

  const handleBack = useCallback(() => {
    if (step === 1) {
      router.navigate('/');
      return;
    }

    setStep(PREVIOUS_STEP[step]);
  }, [step]);

  const handleSubmit = useCallback(() => {
    const draftErrors = validateDraft(draft);

    if (hasErrors(draftErrors)) {
      setErrors(draftErrors);
      setStep(firstInvalidStep(draftErrors));
      return;
    }

    setErrors({});
    setSubmitting(true);
  }, [draft]);

  const handleDone = useCallback(() => {
    reset();
    router.navigate('/');
  }, [reset]);

  return {
    changeCoordinate,
    changeDescription,
    changeEquipment,
    changeName,
    changePhotos,
    draft,
    errors,
    handleBack,
    handleContinue,
    handleDone,
    handleSubmit,
    isLastStep: step === LAST_STEP,
    reset,
    step,
    submitted,
    submitting,
  };
}
