import {
  SPOT_DESCRIPTION_MIN_LENGTH,
  SPOT_NAME_MIN_LENGTH,
  firstInvalidStep,
  hasErrors,
  validateDescription,
  validateDraft,
  validateEquipment,
  validateLocation,
  validateName,
  validatePhotos,
  validateStep,
} from '@/features/spot-editor/validation';
import type { SpotDraft } from '@/features/spot-editor/types';
import { t } from '@/i18n';

/** A draft that passes every rule, so each test changes the one field it is about. */
function makeDraft(overrides: Partial<SpotDraft> = {}): SpotDraft {
  return {
    coordinate: { latitude: 42.7, longitude: 23.3 },
    name: 'Тракия парк',
    description: 'Добра площадка с лостове и успоредка.',
    equipment: [{ name: 'Pull-up', quantity: 1 }],
    photos: [{ kind: 'local', uri: 'file:///photo.jpg', width: 100, height: 100 }],
    ...overrides,
  };
}

describe('validateName', () => {
  it('asks for a name when none was given', () => {
    expect(validateName('')).toBe(t('validation.nameRequired'));
    expect(validateName('   ')).toBe(t('validation.nameRequired'));
  });

  it('counts the name without its edges', () => {
    expect(validateName('a'.repeat(SPOT_NAME_MIN_LENGTH - 1))).toBe(
      t('validation.nameMin', { count: SPOT_NAME_MIN_LENGTH }),
    );
    expect(validateName(`  ${'a'.repeat(SPOT_NAME_MIN_LENGTH)}  `)).toBeUndefined();
  });
});

describe('validateDescription', () => {
  it('asks for a description when none was given', () => {
    expect(validateDescription('')).toBe(t('validation.descriptionRequired'));
  });

  it('rejects a description below the minimum', () => {
    expect(validateDescription('a'.repeat(SPOT_DESCRIPTION_MIN_LENGTH - 1))).toBe(
      t('validation.descriptionMin', { count: SPOT_DESCRIPTION_MIN_LENGTH }),
    );
    expect(validateDescription('a'.repeat(SPOT_DESCRIPTION_MIN_LENGTH))).toBeUndefined();
  });
});

describe('the step checks', () => {
  it('require a coordinate, at least one piece of equipment and one photo', () => {
    expect(validateLocation(null)).toBe(t('validation.locationRequired'));
    expect(validateLocation({ latitude: 0, longitude: 0 })).toBeUndefined();
    expect(validateEquipment([])).toBe(t('validation.equipmentRequired'));
    expect(validatePhotos([])).toBe(t('validation.photosRequired'));
  });
});

describe('validateStep', () => {
  it('reports only the fields the step owns', () => {
    const draft = makeDraft({ name: '', coordinate: null });

    expect(validateStep(1, draft)).toEqual({ location: t('validation.locationRequired') });
    expect(validateStep(2, draft)).toEqual({
      name: t('validation.nameRequired'),
      description: undefined,
    });
    expect(validateStep(3, draft)).toEqual({ equipment: undefined });
    expect(validateStep(4, draft)).toEqual({ photos: undefined });
  });
});

describe('validateDraft, hasErrors and firstInvalidStep', () => {
  it('passes a complete draft', () => {
    const errors = validateDraft(makeDraft());

    expect(hasErrors(errors)).toBe(false);
    expect(errors).toEqual({
      location: undefined,
      name: undefined,
      description: undefined,
      equipment: undefined,
      photos: undefined,
    });
  });

  it('jumps back to the first step carrying an error, in screen order', () => {
    expect(firstInvalidStep(validateDraft(makeDraft({ coordinate: null })))).toBe(1);
    expect(firstInvalidStep(validateDraft(makeDraft({ name: '' })))).toBe(2);
    expect(firstInvalidStep(validateDraft(makeDraft({ equipment: [] })))).toBe(3);
    expect(firstInvalidStep(validateDraft(makeDraft({ photos: [] })))).toBe(4);
    expect(hasErrors(validateDraft(makeDraft({ photos: [] })))).toBe(true);
  });
});
