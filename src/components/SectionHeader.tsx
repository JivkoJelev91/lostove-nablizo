import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type SectionHeaderProps = {
  title: string;
  description?: string;
  /** Right-aligned content such as a "See all" link. */
  action?: ReactNode;
  className?: string;
};

/**
 * The title row that introduces a section.
 *
 * It deliberately excludes the section's content: the owning screen separates the two with a
 * `gap-space-8` to `gap-space-12` (see the design system's section spacing rule).
 */
export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-space-12', className)}>
      <View className="flex-1 gap-space-2">
        <Text accessibilityRole="header" className="font-semibold text-h2 text-text-primary">
          {title}
        </Text>
        {description !== undefined ? (
          <Text className="text-bodySmall text-text-secondary">{description}</Text>
        ) : null}
      </View>

      {action !== undefined ? <View>{action}</View> : null}
    </View>
  );
}
