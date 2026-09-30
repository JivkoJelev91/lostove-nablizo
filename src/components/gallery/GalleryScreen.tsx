import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Card, ScreenShell } from '@/components';
import { cn } from '@/utils/cn';

export type GalleryRowProps = {
  label: string;
  children: ReactNode;
  /** Lays the examples out in a column instead of a wrapping row. */
  stack?: boolean;
};

/** One labelled example inside a gallery group. */
export function GalleryRow({ label, children, stack = false }: GalleryRowProps) {
  return (
    <View className="gap-space-8">
      <Text className="font-medium text-caption uppercase text-text-muted">{label}</Text>
      <View className={cn(stack ? 'gap-space-8' : 'flex-row flex-wrap items-center gap-space-8')}>
        {children}
      </View>
    </View>
  );
}

export type GalleryGroupProps = {
  title: string;
  children: ReactNode;
};

/** A titled card that groups related examples. */
export function GalleryGroup({ title, children }: GalleryGroupProps) {
  return (
    <Card className="gap-section-gap" variant="outlined">
      <Text className="font-semibold text-h3 text-text-primary">{title}</Text>
      {children}
    </Card>
  );
}

export type GalleryScreenProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/** The shell every gallery screen sits in: the same one the app's own routes use. */
export function GalleryScreen({ title, description, children }: GalleryScreenProps) {
  return (
    <ScreenShell description={description} scroll title={title}>
      {children}
    </ScreenShell>
  );
}
