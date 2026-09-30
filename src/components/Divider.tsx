import { View } from 'react-native';

import { cn } from '@/utils/cn';

export type DividerProps = {
  className?: string;
};

/** A one-pixel horizontal rule in the border token colour. */
export function Divider({ className }: DividerProps) {
  return (
    <View
      accessibilityElementsHidden
      className={cn('h-px w-full bg-border', className)}
      importantForAccessibility="no-hide-descendants"
    />
  );
}
