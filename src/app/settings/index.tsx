import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card, DangerButton, Divider, ScreenShell, SectionHeader } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useProfile } from '@/features/profile/useProfile';
import { useScheme } from '@/hooks/useScheme';

type SettingsRowData = {
  label: string;
  /** What the setting currently is, e.g. `Follows system`. Omitted when there is nothing to state. */
  value?: string;
  /** Set only for a row that leads somewhere; the row then earns its chevron. */
  onPress?: () => void;
};

type SettingsGroupData = {
  title: string;
  rows: readonly SettingsRowData[];
};

/**
 * One setting: its name, what it is currently set to, and a chevron when it opens something.
 *
 * The chevron is deliberately tied to `onPress`. A row whose screen does not exist yet states its
 * value instead, so nothing on this screen promises a destination the app cannot open.
 */
function SettingsRow({ label, value, onPress }: SettingsRowData) {
  const scheme = useScheme();

  const content = (
    <View className="flex-row items-center justify-between gap-space-12 px-card-pad py-space-12">
      <Text className="flex-1 text-body text-text-primary">{label}</Text>

      {value !== undefined ? (
        <Text className="text-bodySmall text-text-secondary">{value}</Text>
      ) : null}

      {onPress !== undefined ? (
        <Ionicons color={schemeTextMuted[scheme]} name="chevron-forward" size={iconSizeValues.sm} />
      ) : null}
    </View>
  );

  if (onPress === undefined) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="active:opacity-70"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

/**
 * A titled group of settings in one card.
 *
 * The rows share a surface and are separated by hairlines, so a group reads as a single list
 * rather than as a stack of unrelated cards.
 */
function SettingsGroup({ title, rows }: SettingsGroupData) {
  return (
    <View className="gap-space-8">
      <SectionHeader accent title={title} />

      <Card gap="none" padding="none">
        {rows.map((row, index) => (
          <View key={row.label}>
            {index > 0 ? <Divider /> : null}
            <SettingsRow {...row} />
          </View>
        ))}
      </Card>
    </View>
  );
}

export default function SettingsScreen() {
  const { username } = useProfile();
  const version = Constants.expoConfig?.version;

  const groups: readonly SettingsGroupData[] = [
    {
      title: 'Account',
      rows: [
        {
          label: 'Profile',
          onPress: () => router.navigate('/(tabs)/profile'),
          value: `@${username}`,
        },
        { label: 'Email' },
        { label: 'Security' },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { label: 'Notifications', value: 'On' },
        // Matches the permission app.json declares: location while using the app.
        { label: 'Location', value: 'While using the app' },
        { label: 'Appearance', value: 'Follows system' },
      ],
    },
    {
      title: 'About',
      rows: [{ label: 'Privacy Policy' }, { label: 'Terms' }, { label: 'About the App' }],
    },
  ];

  return (
    <ScreenShell description="Account, preferences and app information" scroll title="Settings">
      {groups.map((group) => (
        <SettingsGroup key={group.title} {...group} />
      ))}

      {/* There is no session to end until Clerk owns authentication, so signing out lands on the
          sign-in screen, which is where a signed-out athlete belongs. */}
      <DangerButton fullWidth label="Log Out" onPress={() => router.replace('/auth/sign-in')} />

      {version !== undefined ? (
        <Text className="text-center text-caption text-text-muted">{`v${version}`}</Text>
      ) : null}
    </ScreenShell>
  );
}
