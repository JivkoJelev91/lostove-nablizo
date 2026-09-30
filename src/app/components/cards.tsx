import { View } from 'react-native';

import { Card, PhotoCard, ReviewCard, SpotCard } from '@/components';
import type { SpotEquipment } from '@/components';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';

const PHOTO = require('@/assets/images/home.jpg') as number;
const DETAIL_PHOTO = require('@/assets/images/spot-details.jpg') as number;

const EQUIPMENT: SpotEquipment[] = [
  { name: 'Pull-up', quantity: 2 },
  { name: 'Dips', quantity: 2 },
  { name: 'Rings' },
];

export default function CardsGalleryScreen() {
  return (
    <GalleryScreen
      description="Cards use an 8px internal gap, a 16px padding token and a 16px radius."
      title="Cards"
    >
      <GalleryGroup title="Card">
        <GalleryRow label="Variants" stack>
          <Card variant="flat">
            <View className="gap-space-2">
              <View className="h-2 w-24 rounded-pill bg-bg-surface" />
              <View className="h-2 w-40 rounded-pill bg-bg-surface" />
            </View>
          </Card>

          <Card variant="elevated">
            <View className="gap-space-2">
              <View className="h-2 w-24 rounded-pill bg-bg-surface" />
              <View className="h-2 w-40 rounded-pill bg-bg-surface" />
            </View>
          </Card>

          <Card variant="outlined">
            <View className="gap-space-2">
              <View className="h-2 w-24 rounded-pill bg-bg-surface" />
              <View className="h-2 w-40 rounded-pill bg-bg-surface" />
            </View>
          </Card>
        </GalleryRow>

        <GalleryRow label="Pressable">
          <View className="w-full">
            <Card accessibilityLabel="Open spot" onPress={() => {}} variant="flat">
              <View className="h-2 w-40 rounded-pill bg-bg-surface" />
            </Card>
          </View>
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Spot card">
        <GalleryRow label="List (photo, favourite, rating, equipment, verified, distance)" stack>
          <SpotCard
            distanceLabel="1.2 km away"
            equipment={EQUIPMENT}
            imageUri={PHOTO}
            isFavorite
            name="Trakia Fitness Park"
            onToggleFavorite={() => {}}
            rating={4.7}
            reviewCount={28}
            verificationLabel="Verified 4 days ago"
            variant="list"
          />
        </GalleryRow>

        <GalleryRow label="Map preview (no photo)" stack>
          <SpotCard
            distanceLabel="1.2 km away"
            equipment={EQUIPMENT}
            name="South Park calisthenics"
            onToggleFavorite={() => {}}
            rating={4.2}
            reviewCount={9}
            variant="map"
            verificationLabel="Verified 2 weeks ago"
          />
        </GalleryRow>

        <GalleryRow label="Compact" stack>
          <SpotCard
            equipment={EQUIPMENT}
            imageUri={DETAIL_PHOTO}
            name="Vitosha Park"
            rating={4.9}
            reviewCount={61}
            variant="compact"
          />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Photo card">
        <GalleryRow label="Pressable, removable, loading">
          <View className="w-40 gap-space-8">
            <PhotoCard
              accessibilityLabel="Pull-up bars"
              onPress={() => {}}
              onRemove={() => {}}
              uri={PHOTO}
            />
            <PhotoCard loading uri={PHOTO} />
          </View>
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Review card">
        <ReviewCard
          authorName="Alex Petrov"
          rating={5}
          text="Great bars and very clean. The rubber surface is well maintained."
          dateLabel="4 days ago"
        />
        <ReviewCard
          authorName="Maria Georgieva"
          rating={4}
          text="Busy at sunset but worth the walk. Rings are a bit worn."
          dateLabel="2 weeks ago"
        />
      </GalleryGroup>
    </GalleryScreen>
  );
}
