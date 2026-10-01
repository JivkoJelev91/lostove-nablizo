import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Avatar, Card, GhostButton, IconButton } from '@/components';
import { iconSizeValues, schemeTextPrimary, schemeTextSecondary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export type ProfileHeaderProps = {
  displayName: string;
  username: string;
  onShare: () => void;
  onSignIn: () => void;
};

/**
 * The athlete's identity: avatar, name and the handle in its own bordered pill, the share
 * action, and the way into the auth screens until a real session owns them.
 *
 * The handle gets the border rather than the name because it is the part that reads as a tag;
 * the name stays the largest thing on the card, so the hierarchy does not change.
 */
export function ProfileHeader({ displayName, username, onShare, onSignIn }: ProfileHeaderProps) {
  const scheme = useScheme();

  return (
    <Card gap="md">
      <View className="flex-row items-center gap-space-12">
        <Avatar name={displayName} size="lg" />

        <View className="gap-space-6 flex-1">
          <Text className="font-semibold text-h2 text-text-primary" numberOfLines={1}>
            {displayName}
          </Text>

          <View className="flex-row items-center gap-space-4 self-start rounded-pill border border-border bg-bg-surface px-space-8 py-space-4">
            <Ionicons color={schemeTextSecondary[scheme]} name="at" size={iconSizeValues.xs} />
            <Text className="text-caption text-text-secondary">{username}</Text>
          </View>
        </View>

        <IconButton
          accessibilityLabel="Share profile"
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
      </View>

      {/* The identity above is the mock athlete. Until Clerk owns the session there is no real
          one, so the button stays as the way into the auth screens. */}
      <GhostButton label="Sign in" onPress={onSignIn} />
    </Card>
  );
}
