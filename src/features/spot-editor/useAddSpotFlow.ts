import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { BackHandler } from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import type { Coordinate, Spot, SpotSubmission } from '@/features/spots/types';
import { useSpots } from '@/features/spots/useSpots';
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

/** The store's input for a finished draft, or null when the coordinate never arrived. */
function submissionFromDraft(draft: SpotDraft): SpotSubmission | null {
  const coordinate = draft.coordinate;

  if (coordinate === null) {
    return null;
  }

  return {
    name: draft.name,
    description: draft.description,
    coordinate,
    equipment: draft.equipment.map((item) => ({ name: item.name, quantity: item.quantity })),
    images: draft.photos,
  };
}

/**
 * Android's back gesture walks the wizard backwards before it leaves the tab. Once the spot is
 * submitted the wizard has nothing left to walk — the success screen is the end of the flow —
 * so back falls through and leaves the tab like it would anywhere else.
 */
function useWizardBackStep(
  step: AddSpotStep,
  submitted: boolean,
  setStep: Dispatch<SetStateAction<AddSpotStep>>,
) {
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
    }, [setStep, step, submitted]),
  );
}

/**
 * The Add Spot wizard's state: the draft, the current step, validation errors, and the submit
 * lifecycle.
 *
 * A finished draft goes to the spots store as a spot waiting for review; the brief simulated
 * save is only there until a real request replaces it. Everything the flow needs to decide —
 * including where Android's back gesture goes — lives here, leaving the screen to lay out
 * what it returns.
 */
export function useAddSpotFlow() {
  const { addSpot } = useSpots();
  const [step, setStep] = useState<AddSpotStep>(1);
  const [draft, setDraft] = useState<SpotDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<SpotDraftErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdSpot, setCreatedSpot] = useState<Spot | null>(null);
  const submittedRef = useRef(false);

  const reset = useCallback(() => {
    setStep(1);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitting(false);
    setSubmitted(false);
    setCreatedSpot(null);
    submittedRef.current = false;
  }, []);

  useEffect(() => {
    if (!submitting) {
      return;
    }

    const timeout = setTimeout(() => {
      const submission = submissionFromDraft(draft);

      if (submission === null) {
        // `validateDraft` already rejected this; the guard only satisfies the type here.
        setSubmitting(false);
        return;
      }

      setCreatedSpot(addSpot(submission));
      setSubmitting(false);
      setSubmitted(true);
      submittedRef.current = true;
    }, SUBMIT_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [addSpot, draft, submitting]);

  // Coming back to the tab after a finished flow should greet the user with a fresh form.
  useFocusEffect(
    useCallback(() => {
      if (submittedRef.current) {
        reset();
      }
    }, [reset]),
  );

  useWizardBackStep(step, submitted, setStep);

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

  const handleViewSpot = useCallback(() => {
    if (createdSpot === null) {
      return;
    }

    router.push({ pathname: '/spot/[id]', params: { id: createdSpot.id } });
  }, [createdSpot]);

  return {
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
    isLastStep: step === LAST_STEP,
    reset,
    step,
    submitted,
    submitting,
  };
}
