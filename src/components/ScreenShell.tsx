import { View } from 'react-native';
import type { ReactNode } from 'react';
import type { Edge } from 'react-native-safe-area-context';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { cn } from '@/utils/cn';

export type ScreenShellVariant = 'tab' | 'stack';

type ScreenShellBaseProps = {
  description?: string;
  /** Header content on the trailing edge, such as an icon button. */
  action?: ReactNode;
  /**
   * `tab` is a bottom-nav destination: no back control and the bottom safe area is left to
   * the tab bar. `stack` is a pushed screen: it has a back control and insets the bottom
   * itself so the home indicator never sits over content.
   */
  variant?: ScreenShellVariant;
  /** Overrides the variant's own answer for whether the back control shows. */
  back?: boolean;
  /** Set false when the content owns its horizontal padding, such as an edge-to-edge map. */
  padded?: boolean;
  /** Wraps the content in a scroll view that owns its bottom padding and dismisses the keyboard. */
  scroll?: boolean;
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
};

/**
 * The title is required exactly when the header shows: a screen that supplies its own top
 * controls (the map) must not be forced to invent a title for a header it never renders.
 */
export type ScreenShellProps =
  | (ScreenShellBaseProps & { header?: true; title: string })
  | (ScreenShellBaseProps & { header: false; title?: string });

const VARIANT_EDGES: Record<ScreenShellVariant, Edge[]> = {
  tab: ['top'],
  stack: ['top', 'bottom'],
};

/**
 * The layout every route is built on: safe area, a title header and padded content.
 *
 * The shell owns the layout contract so screens cannot drift apart: horizontal padding is
 * always 16, the header always starts 8 below the safe area, sections are always 24 apart,
 * and scrollable content always ends with 32 of padding so the bottom navigation never sits
 * over the last row. Screens supply content, not spacing.
 *
 * Keyboard awareness lives in the scroll view: iOS adjusts its insets while Android resizes
 * the window, so a form scrolls itself clear of the keyboard without the screen thinking
 * about it.
 *
 * Immersive screens opt out deliberately: `header={false}` drops the title row and
 * `padded={false}` hands the horizontal padding to the screen. The map needs both.
 */
export function ScreenShell(props: ScreenShellProps) {
  const {
    description,
    action,
    variant = 'stack',
    back,
    padded = true,
    scroll = false,
    children,
    className,
    contentContainerClassName,
  } = props;

  const headerElement =
    props.header === false ? null : (
      <ScreenHeader
        action={action}
        back={back ?? variant === 'stack'}
        description={description}
        title={props.title}
      />
    );

  if (scroll) {
    return (
      <Screen
        className={className}
        contentContainerClassName={cn(
          'gap-section-gap pb-section-gap-lg pt-space-8',
          padded && 'px-screen-px',
          contentContainerClassName,
        )}
        edges={VARIANT_EDGES[variant]}
        padded={false}
        scroll
      >
        {headerElement}
        {children}
      </Screen>
    );
  }

  return (
    <Screen className={className} edges={VARIANT_EDGES[variant]} padded={false}>
      <View
        className={cn(
          'flex-1 gap-section-gap pt-space-8',
          padded && 'px-screen-px',
          contentContainerClassName,
        )}
      >
        {headerElement}
        {children}
      </View>
    </Screen>
  );
}
