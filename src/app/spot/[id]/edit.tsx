import { useLocalSearchParams } from 'expo-router';

import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import { useSpots } from '@/features/spots/useSpots';
import { EditSpotForm } from '@/features/spot-editor/EditSpotForm';
import { t } from '@/i18n';

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spotById } = useSpots();
  const { user } = useCurrentUser();
  const spot = spotById(id);

  // Editing is the owner's action only, and a closed spot has left the directory for good, so
  // both cases answer like an unknown id rather than opening a form that cannot submit.
  if (spot === undefined || spot.ownerId === undefined || spot.ownerId !== user?.id) {
    return <SpotNotFound />;
  }

  if (spot.status === 'closed') {
    return (
      <SpotNotFound description={t('spot.closedEditDescription')} title={t('spot.closedTitle')} />
    );
  }

  return <EditSpotForm spot={spot} />;
}
