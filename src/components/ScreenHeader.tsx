import { router } from 'expo-router';
import { View } from 'react-native';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';

import { IconButton } from '@/components/IconButton';
import { SectionHeader } from '@/components/SectionHeader';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type ScreenHeaderProps = {
  title: string;
  description?: string;
  /** Shows the back control. Set false on a screen that has no back destination. */
  back?: boolean;
  /** Right-aligned content such as an action button. */
  action?: ReactNode;
  className?: string;
};

/**
 * The header a pushed screen draws for itself: a back control and a section title.
 *
 * The app runs with the navigator's own header hidden, so every pushed screen composes this
 * instead of the navigator, which keeps the typography and spacing identical across screens.
 */
export function ScreenHeader({
  title,
  description,
  back = true,
  action,
  className,
}: ScreenHeaderProps) {
  const scheme = useScheme();

  return (
    <View className={cn('flex-row items-center gap-space-8', className)}>
      {back ? (
        <IconButton
          accessibilityLabel={t('common.back')}
          icon={
            <Ionicons
              color={schemeTextPrimary[scheme]}
              name="chevron-back"
              size={iconSizeValues.md}
            />
          }
          onPress={() => router.back()}
          variant="surface"
        />
      ) : null}

      <SectionHeader action={action} className="flex-1" description={description} title={title} />
    </View>
  );
}
