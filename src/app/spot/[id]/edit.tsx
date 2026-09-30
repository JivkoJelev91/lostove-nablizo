import { useLocalSearchParams } from 'expo-router';

import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import { EditSpotForm } from '@/features/spot-editor/EditSpotForm';

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = MOCK_SPOTS.find((candidate) => candidate.id === id);

  if (spot === undefined) {
    return <SpotNotFound />;
  }

  return <EditSpotForm spot={spot} />;
}
