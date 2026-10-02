import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type SectionHeaderTitleSize = 'h2' | 'h1';

export type SectionHeaderProps = {
  title: string;
  description?: string;
  /** `h1` for a screen's main section, `h2` for the sections nested under it. */
  titleSize?: SectionHeaderTitleSize;
  /** Draws the lime bar before the title, as the spot page's sections do. */
  accent?: boolean;
  /** Right-aligned content such as a "See all" link. */
  action?: ReactNode;
  className?: string;
};

const TITLE_CLASS: Record<SectionHeaderTitleSize, string> = {
  h1: 'font-bold text-h1',
  h2: 'font-semibold text-h2',
};

/**
 * The title row that introduces a section.
 *
 * It deliberately excludes the section's content: the owning screen separates the two with a
 * `gap-space-8` to `gap-space-12` (see the design system's section spacing rule).
 */
export function SectionHeader({
  title,
  description,
  titleSize = 'h2',
  accent = false,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-space-12', className)}>
      <View className="flex-1 gap-space-2">
        <View className="flex-row items-center gap-space-8">
          {accent ? (
            <View accessible={false} className="h-icon-sm w-space-4 rounded-pill bg-primary" />
          ) : null}
          <Text
            accessibilityRole="header"
            className={cn(TITLE_CLASS[titleSize], 'text-text-primary')}
          >
            {title}
          </Text>
        </View>
        {description !== undefined ? (
          <Text className="font-regular text-bodySmall text-text-secondary">{description}</Text>
        ) : null}
      </View>

      {action !== undefined ? <View>{action}</View> : null}
    </View>
  );
}
