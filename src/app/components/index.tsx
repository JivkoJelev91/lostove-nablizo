import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Card, Screen, SectionHeader } from '@/components';
import { GalleryGroup } from '@/components/gallery/GalleryScreen';

const GROUPS = [
  {
    href: '/components/buttons',
    title: 'Buttons',
    blurb: 'Primary, secondary, ghost, danger, icon',
  },
  { href: '/components/inputs', title: 'Inputs', blurb: 'Text field, search, textarea' },
  { href: '/components/cards', title: 'Cards', blurb: 'Card, spot, photo, review' },
  { href: '/components/chips', title: 'Chips', blurb: 'Chip, filter, equipment, status' },
  {
    href: '/components/data',
    title: 'Data display',
    blurb: 'Rating, avatar, divider, section header',
  },
  { href: '/components/feedback', title: 'Feedback', blurb: 'Spinner, skeleton, empty, error' },
  {
    href: '/components/spot-details',
    title: 'Spot details',
    blurb: 'Photo grid, equipment list, verification',
  },
  {
    href: '/components/overlays',
    title: 'Overlays & layout',
    blurb: 'Bottom sheet, modal, screen',
  },
] as const;

export default function ComponentsIndexScreen() {
  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-section-gap px-screen-px pb-section-gap-lg"
      >
        <SectionHeader
          description="Every base component rendered with the design system. Tap a group to preview it."
          title="Component library"
        />

        <View className="gap-list-gap">
          {GROUPS.map((group) => (
            <Card
              accessibilityLabel={group.title}
              key={group.href}
              onPress={() => router.push(group.href)}
            >
              <View className="flex-1 gap-space-2">
                <Text className="font-semibold text-h3 text-text-primary">{group.title}</Text>
                <Text className="text-bodySmall text-text-secondary">{group.blurb}</Text>
              </View>
            </Card>
          ))}
        </View>

        <GalleryGroup title="Theme">
          <Text className="text-bodySmall text-text-secondary">
            Switch the device between light and dark mode: every colour here follows the system.
          </Text>
        </GalleryGroup>
      </ScrollView>
    </Screen>
  );
}
