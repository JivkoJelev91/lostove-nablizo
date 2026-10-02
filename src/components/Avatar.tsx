import { Image, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = {
  /** Image source: a remote `{ uri }` or a local `require(...)` asset. */
  uri?: ImageSourcePropType;
  /** Used for the fallback initials and the default accessibility label. */
  name?: string;
  size?: AvatarSize;
  accessibilityLabel?: string;
  className?: string;
};

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-icon-lg w-icon-lg',
  md: 'h-review-avatar w-review-avatar',
  lg: 'h-control w-control',
};

const TEXT_CLASS: Record<AvatarSize, string> = {
  sm: 'text-caption',
  md: 'text-bodySmall',
  lg: 'text-body',
};

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

/** A circular profile image, falling back to initials when no image is available. */
export function Avatar({ uri, name, size = 'md', accessibilityLabel, className }: AvatarProps) {
  const label = accessibilityLabel ?? name ?? t('common.profilePhoto');

  if (uri !== undefined) {
    return (
      <Image
        accessibilityLabel={label}
        accessibilityRole="image"
        accessible
        className={cn('rounded-pill bg-bg-surface', SIZE_CLASS[size], className)}
        source={uri}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
      className={cn(
        'items-center justify-center rounded-pill border border-border bg-bg-surface',
        SIZE_CLASS[size],
        className,
      )}
    >
      <Text className={cn('font-semibold text-text-secondary', TEXT_CLASS[size])}>
        {name !== undefined ? initialsOf(name) : '?'}
      </Text>
    </View>
  );
}
