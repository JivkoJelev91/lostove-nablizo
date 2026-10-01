import { SpotCard } from '@/components';
import { coverImage } from '@/features/spots/spot-photos';
import type { Spot } from '@/features/spots/types';

export type ProfileSpotCardProps = {
  spot: Spot;
  onPress: () => void;
};

/**
 * A spot in the athlete's own lists: the shared card plus the two facts only an owner needs,
 * its moderation state and a rating only once reviews exist.
 */
export function ProfileSpotCard({ spot, onPress }: ProfileSpotCardProps) {
  const hasReviews = spot.reviewCount > 0;

  return (
    <SpotCard
      equipment={spot.equipment}
      imageUri={coverImage(spot)}
      name={spot.name}
      onPress={onPress}
      rating={hasReviews ? spot.rating : undefined}
      reviewCount={hasReviews ? spot.reviewCount : undefined}
      status={spot.status}
      variant="compact"
    />
  );
}
