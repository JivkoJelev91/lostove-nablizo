import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Card, IconButton, Screen, SectionHeader } from '@/components';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { Ionicons } from '@expo/vector-icons';
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

/** The scrollable shell every gallery screen sits in, with a back control. */
export function GalleryScreen({ title, description, children }: GalleryScreenProps) {
  const scheme = useScheme();

  return (
    // `padded={false}` because the ScrollView below supplies the horizontal padding itself;
    // leaving Screen's own padding on would double it to 32.
    <Screen padded={false}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-section-gap px-screen-px pb-section-gap-lg"
      >
        <View className="flex-row items-center gap-space-8">
          <IconButton
            accessibilityLabel="Back"
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
          <SectionHeader className="flex-1" description={description} title={title} />
        </View>

        {children}
      </ScrollView>
    </Screen>
  );
}
