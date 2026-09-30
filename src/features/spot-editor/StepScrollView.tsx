import { ScrollView } from 'react-native';
import type { ReactNode } from 'react';

export type StepScrollViewProps = {
  children: ReactNode;
};

/**
 * The scrolling body shared by the wizard's form steps.
 *
 * The step headings and the Continue action live outside it, so only the content between
 * them moves while the keyboard is up.
 */
export function StepScrollView({ children }: StepScrollViewProps) {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      className="flex-1"
      contentContainerClassName="gap-space-16 px-screen-px pb-space-24 pt-space-16"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
