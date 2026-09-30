import { ScrollView, View } from 'react-native';
import type { ReactNode } from 'react';
import type { Edge } from 'react-native-safe-area-context';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { cn } from '@/utils/cn';

export type ScreenProps = {
  children: ReactNode;
  /** Wraps the content in a vertical ScrollView. Defaults to false. */
  scroll?: boolean;
  /** Applies the 16px horizontal screen padding. Defaults to true. */
  padded?: boolean;
  /** Replaces the content with a centred spinner. */
  loading?: boolean;
  /** Safe-area edges to inset. Defaults to top and bottom. */
  edges?: Edge[];
  contentContainerClassName?: string;
  /**
   * Applied to the safe-area container, not the content. Keep it to surface concerns
   * (`bg-*`, `border-*`): the content already sits inside a `flex-1` wrapper, so layout
   * classes here do nothing useful. Put `flex-1 items-center justify-center gap-*` on a
   * child `View` instead, or the content will not be laid out as intended.
   */
  className?: string;
};

/**
 * The screen container: a safe-area background that optionally scrolls and pads.
 *
 * It owns nothing but layout. Loading, empty and error content are passed as children so a
 * screen can compose them without `Screen` knowing what any of them are.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  loading = false,
  edges = ['top', 'bottom'],
  contentContainerClassName,
  className,
}: ScreenProps) {
  return (
    <SafeAreaView className={cn('flex-1 bg-bg-main', className)} edges={edges}>
      {loading ? (
        <LoadingSpinner className="flex-1" label="Loading" />
      ) : scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn(padded && 'px-screen-px', contentContainerClassName)}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1', padded && 'px-screen-px')}>{children}</View>
      )}
    </SafeAreaView>
  );
}
