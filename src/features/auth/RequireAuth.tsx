import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingSpinner, PrimaryButton } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useRequireAuth } from '@/features/auth/useRequireAuth';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

export type RequireAuthProps = {
  children: ReactNode;
};

/**
 * Wraps a screen or a section that only makes sense for a signed-in athlete.
 *
 * This is the route-level half of the guard: the action-level half is `useRequireAuth`, and
 * together they mean no protected write is reachable by a guest from either direction. What a
 * guest gets is not a dead end and not a redirect that loses the context — it is the sign-in
 * screen, with the reason it is being asked for stated in the athlete's own words.
 *
 * The redirect is the important part. Pushing `/auth` and leaving the screen mounted behind it
 * means signing in returns the athlete to the thing they were trying to do, rather than dropping
 * them on the home tab and making them find it again.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const scheme = useScheme();
  const { checking, signedIn } = useRequireAuth();
  const pathname = usePathname();

  // The stored session is read on launch, so the first frames are not yet an answer. Rendering the
  // sign-in prompt here would flash "sign in to see this" at a signed-in athlete on every cold
  // start, so the wait is a spinner rather than a decision.
  if (checking) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-bg-main"
        edges={['top', 'bottom']}
      >
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (signedIn) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView className="flex-1 justify-center bg-bg-main" edges={['top', 'bottom']}>
      <EmptyState
        action={
          <PrimaryButton
            label={t('auth.guard.signIn')}
            onPress={() => router.push({ pathname: '/auth', params: { next: pathname } })}
          />
        }
        description={t('auth.guard.reason')}
        icon={
          <Ionicons
            color={schemeTextMuted[scheme]}
            name="lock-closed-outline"
            size={iconSizeValues.lg}
          />
        }
        padded={false}
        title={t('auth.guard.title')}
      />
    </SafeAreaView>
  );
}
