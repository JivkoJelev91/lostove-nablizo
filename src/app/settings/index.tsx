import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Card, DangerButton, Divider, ScreenShell, SectionHeader } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { isAuthFailure, signOut } from '@/features/auth/auth-api';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { useProfile } from '@/features/profile/useProfile';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

type SettingsRowData = {
  label: string;
  /** What the setting currently is, e.g. `Следва системата`. Omitted when there is nothing to state. */
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
  const { user } = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutProblem, setSignOutProblem] = useState<TranslationKey | null>(null);
  const version = Constants.expoConfig?.version;

  const email = user?.email ?? undefined;

  const logOut = async () => {
    setSignOutProblem(null);
    setSigningOut(true);

    try {
      await signOut();
      router.replace('/auth');
    } catch (failure: unknown) {
      setSignOutProblem(isAuthFailure(failure) ? failure.key : 'auth.error.generic');
    } finally {
      setSigningOut(false);
    }
  };

  const groups: readonly SettingsGroupData[] = [
    {
      title: t('settings.account'),
      rows: [
        {
          label: t('settings.profile'),
          onPress: () => router.navigate('/(tabs)/profile'),
          value: username === '' ? undefined : `@${username}`,
        },
        { label: t('settings.email'), value: email },
      ],
    },
    {
      title: t('settings.preferences'),
      rows: [
        { label: t('settings.notifications'), value: t('settings.on') },
        // Matches the permission app.json declares: location while using the app.
        { label: t('settings.location'), value: t('settings.locationWhileUsing') },
        { label: t('settings.appearance'), value: t('settings.followsSystem') },
      ],
    },
    {
      title: t('settings.about'),
      rows: [
        { label: t('settings.privacy') },
        { label: t('settings.terms') },
        { label: t('settings.aboutApp') },
      ],
    },
  ];

  return (
    <ScreenShell description={t('settings.description')} scroll title={t('settings.title')}>
      {groups.map((group) => (
        <SettingsGroup key={group.title} {...group} />
      ))}

      {/* Ends the Supabase Auth session, which is what the rest of the app reads to decide who is
          using it. The screen it lands on is the signed-out home of the account screens. */}
      <DangerButton
        fullWidth
        label={t('settings.logOut')}
        loading={signingOut}
        onPress={() => {
          void logOut();
        }}
      />

      {signOutProblem !== null ? (
        <Text className="text-bodySmall text-status-bad">{t(signOutProblem)}</Text>
      ) : null}

      {version !== undefined ? (
        <Text className="text-center text-caption text-text-muted">{`v${version}`}</Text>
      ) : null}
    </ScreenShell>
  );
}
