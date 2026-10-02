import { useLocalSearchParams } from 'expo-router';

import { RequireAuth } from '@/features/auth/RequireAuth';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { SpotNotFound } from '@/features/spots/SpotNotFound';
import { useSpots } from '@/features/spots/useSpots';
import { EditSpotForm } from '@/features/spot-editor/EditSpotForm';
import { t } from '@/i18n';

/**
 * Editing is an owner's action, so it is guarded twice: `RequireAuth` turns a guest away at the
 * door, and the ownership check below turns away a signed-in athlete who is not the owner.
 *
 * The two are not the same check and neither replaces the other. The first is about having an
 * account at all; the second is about this account's relationship to this spot, and it is the one
 * the RLS policy repeats on the database. A guest and a non-owner both answer "not found" once
 * past the guard, deliberately: telling a stranger that a spot exists but is not theirs leaks that
 * the spot is real.
 */
export default function EditSpotScreen() {
  return (
    <RequireAuth>
      <OwnerOnlyEditor />
    </RequireAuth>
  );
}

function OwnerOnlyEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spotById } = useSpots();
  const { user } = useCurrentUser();
  const spot = spotById(id);

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
