import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** A decorative icon, usually a 32–40px glyph in the muted colour. */
  icon?: ReactNode;
  /** A call to action, typically a button. */
  action?: ReactNode;
  className?: string;
};

/** A centred, friendly placeholder for a screen or list that has no content yet. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <View
      className={cn('items-center justify-center gap-space-12 px-screen-px py-space-32', className)}
    >
      {icon !== undefined ? (
        <View
          accessible={false}
          className="h-icon-xl w-icon-xl items-center justify-center rounded-pill bg-bg-surface"
        >
          {icon}
        </View>
      ) : null}

      <View className="gap-space-4">
        <Text className="text-center font-semibold text-h3 text-text-primary">{title}</Text>
        {description !== undefined ? (
          <Text className="text-center text-bodySmall text-text-secondary">{description}</Text>
        ) : null}
      </View>

      {action !== undefined ? <View>{action}</View> : null}
    </View>
  );
}
