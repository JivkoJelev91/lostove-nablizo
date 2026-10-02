import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Avatar, Card, IconButton, PrimaryButton } from '@/components';
import { iconSizeValues, schemeTextPrimary, schemeTextSecondary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

export type ProfileHeaderProps = {
  /** The signed-in athlete's name, or an empty string when nobody is signed in. */
  displayName: string;
  /** Their handle, or an empty string when there is none to show. */
  username: string;
  /** Whether a real account owns this profile, which is what the sign-in button exists for. */
  signedIn: boolean;
  onShare: () => void;
  onSignIn: () => void;
};

/**
 * The athlete's identity: avatar, name and the handle in its own bordered pill, the share
 * action, and — while nobody is signed in — the way into the auth screens.
 *
 * With no account there is no name to show, so the card says so instead of inventing one. The
 * handle gets the border rather than the name because it is the part that reads as a tag; the name
 * stays the largest thing on the card, so the hierarchy does not change.
 */
export function ProfileHeader({
  displayName,
  username,
  signedIn,
  onShare,
  onSignIn,
}: ProfileHeaderProps) {
  const scheme = useScheme();
  const name = displayName === '' ? t('profile.guestName') : displayName;

  return (
    <Card gap="md">
      <View className="flex-row items-center gap-space-12">
        <Avatar name={name} size="lg" />

        <View className="flex-1 gap-space-8">
          <Text className="font-semibold text-h2 text-text-primary" numberOfLines={1}>
            {name}
          </Text>

          {username === '' ? null : (
            <View className="flex-row items-center gap-space-4 self-start rounded-pill border border-border bg-bg-surface px-space-8 py-space-4">
              <Ionicons color={schemeTextSecondary[scheme]} name="at" size={iconSizeValues.xs} />
              <Text className="font-medium text-caption text-text-secondary">{username}</Text>
            </View>
          )}
        </View>

        {/* Sharing a profile shares a name and a handle; with nobody signed in there is nothing
            to share, so the action is not offered. */}
        {signedIn ? (
          <IconButton
            accessibilityLabel={t('profile.shareLabel')}
            icon={
              <Ionicons
                color={schemeTextPrimary[scheme]}
                name="share-social-outline"
                size={iconSizeValues.md}
              />
            }
            onPress={onShare}
            variant="surface"
          />
        ) : null}
      </View>

      {signedIn ? null : <PrimaryButton label={t('profile.signIn')} onPress={onSignIn} />}
    </Card>
  );
}
