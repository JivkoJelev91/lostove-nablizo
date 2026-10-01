import { useLocalSearchParams } from 'expo-router';

import { CURRENT_USER_ID } from '@/features/profile/current-user';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import { useSpots } from '@/features/spots/useSpots';
import { EditSpotForm } from '@/features/spot-editor/EditSpotForm';

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spotById } = useSpots();
  const spot = spotById(id);

  // Editing is the owner's action only, and a closed spot has left the directory for good, so
  // both cases answer like an unknown id rather than opening a form that cannot submit.
  if (spot === undefined || spot.ownerId !== CURRENT_USER_ID) {
    return <SpotNotFound />;
  }

  if (spot.status === 'closed') {
    return (
      <SpotNotFound
        description="This spot is closed, so it can no longer be edited."
        title="Spot closed"
      />
    );
  }

  return <EditSpotForm spot={spot} />;
}
