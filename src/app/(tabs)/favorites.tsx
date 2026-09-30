import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, PrimaryButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export default function FavoritesScreen() {
  const scheme = useScheme();

  return (
    <ScreenShell description="Spots you saved for later" title="Favorites" variant="tab">
      <EmptyState
        action={<PrimaryButton label="Explore the map" onPress={() => router.navigate('/')} />}
        className="flex-1 justify-center"
        description="Tap the heart on a spot and it will be waiting for you here."
        icon={
          <Ionicons color={schemeTextMuted[scheme]} name="heart-outline" size={iconSizeValues.lg} />
        }
        padded={false}
        title="No favourites yet"
      />
    </ScreenShell>
  );
}
