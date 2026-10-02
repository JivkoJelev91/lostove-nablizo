import { RequireAuth } from '@/features/auth/RequireAuth';
import { AddSpotFlow } from '@/features/spot-editor/AddSpotFlow';

/**
 * A guest can find spots here, but only a signed-in athlete can add one.
 *
 * The guard wraps the whole flow rather than the submit button: a form that can be filled in and
 * then refuses to save is a worse experience than being told up front, and the whole screen exists
 * to do the one thing that needs an account.
 */
export default function AddSpotScreen() {
  return (
    <RequireAuth>
      <AddSpotFlow />
    </RequireAuth>
  );
}
