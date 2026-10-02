import { View } from 'react-native';

import { SpotCard } from '@/components';
import { formatDistanceAway } from '@/features/spots/format-distance';
import { coverImage } from '@/features/spots/spot-photos';
import type { Spot } from '@/features/spots/types';

export type FeedSpotCardProps = {
  spot: Spot;
  isFavorite: boolean;
  onOpen: (spot: Spot) => void;
  onToggleFavorite: (spot: Spot) => void;
};

/** One feed row: the card with the distance label and the heart wired to the screen's actions. */
export function FeedSpotCard({ spot, isFavorite, onOpen, onToggleFavorite }: FeedSpotCardProps) {
  return (
    <View className="px-screen-px">
      <SpotCard
        distanceLabel={formatDistanceAway(spot.distanceMeters)}
        equipment={spot.equipment}
        imageUri={coverImage(spot)}
        isFavorite={isFavorite}
        name={spot.name}
        onPress={() => onOpen(spot)}
        onToggleFavorite={() => onToggleFavorite(spot)}
        rating={spot.rating}
        reviewCount={spot.reviewCount}
        variant="list"
        verifiedAt={spot.verifiedAt}
      />
    </View>
  );
}
