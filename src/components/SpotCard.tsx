import { Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PhotoImage } from '@/components/PhotoImage';
import { Rating } from '@/components/Rating';
import { SpotStatusBadge } from '@/components/SpotStatusBadge';
import type { SpotStatus } from '@/components/SpotStatusBadge';
import { VerificationBadge } from '@/components/VerificationBadge';
import type { VerifiedAt } from '@/components/VerificationBadge';
import { iconSizeValues, schemeTextSecondary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { equipmentLabel } from '@/i18n/equipment';

export type SpotEquipment = {
  name: string;
  quantity?: number;
};

export type SpotCardVariant = 'list' | 'map' | 'compact';

export type SpotCardProps = {
  name: string;
  rating?: number;
  reviewCount?: number;
  equipment?: readonly SpotEquipment[];
  /**
   * When the spot was last verified, as a `Date` or an ISO string. The badge works out the
   * wording and the colour from it, so a date that is six weeks old stops looking reassuring.
   */
  verifiedAt?: VerifiedAt;
  /** e.g. `1,2 км от теб`. */
  distanceLabel?: string;
  imageUri?: ImageSourcePropType;
  isFavorite?: boolean;
  /**
   * The spot's moderation state, for the owner's own lists. Public surfaces never pass it,
   * because only approved spots reach them.
   */
  status?: SpotStatus;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  variant?: SpotCardVariant;
  accessibilityLabel?: string;
  className?: string;
};

function formatEquipment(equipment: readonly SpotEquipment[], withQuantity: boolean): string {
  return equipment
    .map((item) =>
      withQuantity && item.quantity !== undefined
        ? `${equipmentLabel(item.name)} ×${item.quantity}`
        : equipmentLabel(item.name),
    )
    .join(' · ');
}

type SpotBodyProps = {
  name: string;
  rating?: number;
  reviewCount?: number;
  equipmentText: string;
  verifiedAt?: VerifiedAt;
  distanceLabel?: string;
  isFavorite: boolean;
  status?: SpotStatus;
  onToggleFavorite?: () => void;
};

function SpotBody({
  name,
  rating,
  reviewCount,
  equipmentText,
  verifiedAt,
  distanceLabel,
  isFavorite,
  status,
  onToggleFavorite,
}: SpotBodyProps) {
  const scheme = useScheme();
  const showFooter = verifiedAt !== undefined || distanceLabel !== undefined;

  return (
    <View className="gap-spot-gap p-card-pad">
      <View className="flex-row items-start justify-between gap-space-8">
        <Text className="flex-1 font-semibold text-h2 text-text-primary" numberOfLines={2}>
          {name}
        </Text>
        {onToggleFavorite !== undefined ? (
          <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
        ) : null}
      </View>

      {rating !== undefined ? (
        <Rating count={reviewCount} size="sm" value={rating} variant="summary" />
      ) : null}

      {status !== undefined ? <SpotStatusBadge status={status} /> : null}

      {equipmentText.length > 0 ? (
        <Text className="text-bodySmall text-text-secondary" numberOfLines={2}>
          {equipmentText}
        </Text>
      ) : null}

      {showFooter ? (
        <View className="flex-row items-center justify-between gap-space-8">
          {verifiedAt !== undefined ? <VerificationBadge verifiedAt={verifiedAt} /> : <View />}

          {distanceLabel !== undefined ? (
            <View className="flex-row items-center gap-space-4">
              <Ionicons
                color={schemeTextSecondary[scheme]}
                name="location-outline"
                size={iconSizeValues.xs}
              />
              <Text className="text-caption text-text-secondary">{distanceLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type CompactSpotCardProps = {
  name: string;
  rating?: number;
  reviewCount?: number;
  equipmentText: string;
  imageUri?: ImageSourcePropType;
  isFavorite: boolean;
  status?: SpotStatus;
  onToggleFavorite?: () => void;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
};

function CompactSpotCard({
  name,
  rating,
  reviewCount,
  equipmentText,
  imageUri,
  isFavorite,
  status,
  onToggleFavorite,
  onPress,
  accessibilityLabel,
  className,
}: CompactSpotCardProps) {
  return (
    <Card
      accessibilityLabel={accessibilityLabel}
      className={className}
      gap="sm"
      onPress={onPress}
      padding="sm"
      variant="flat"
    >
      <View className="flex-row items-center gap-space-12">
        {imageUri !== undefined ? (
          <PhotoImage
            accessibilityLabel={name}
            className="h-equipment-tile w-equipment-tile rounded-md bg-bg-surface"
            source={imageUri}
          />
        ) : null}

        <View className="flex-1 gap-space-4">
          <Text className="font-semibold text-h3 text-text-primary" numberOfLines={1}>
            {name}
          </Text>
          {rating !== undefined ? (
            <Rating count={reviewCount} size="sm" value={rating} variant="summary" />
          ) : null}
          {status !== undefined ? <SpotStatusBadge status={status} /> : null}
          {equipmentText.length > 0 ? (
            <Text className="text-bodySmall text-text-secondary" numberOfLines={1}>
              {equipmentText}
            </Text>
          ) : null}
        </View>

        {onToggleFavorite !== undefined ? (
          <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
        ) : null}
      </View>
    </Card>
  );
}

/**
 * A spot summary in three densities: a photo-led list card, a text-only map preview and a
 * compact row. It renders data and reports intent through callbacks; it never fetches.
 */
export function SpotCard({
  name,
  rating,
  reviewCount,
  equipment = [],
  verifiedAt,
  distanceLabel,
  imageUri,
  isFavorite = false,
  status,
  onPress,
  onToggleFavorite,
  variant = 'list',
  accessibilityLabel,
  className,
}: SpotCardProps) {
  const equipmentText = formatEquipment(equipment, variant !== 'map');

  if (variant === 'compact') {
    return (
      <CompactSpotCard
        accessibilityLabel={accessibilityLabel ?? name}
        className={className}
        equipmentText={equipmentText}
        imageUri={imageUri}
        isFavorite={isFavorite}
        name={name}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
        rating={rating}
        reviewCount={reviewCount}
        status={status}
      />
    );
  }

  return (
    <Card
      accessibilityLabel={accessibilityLabel ?? name}
      className={className}
      gap="none"
      onPress={onPress}
      padding="none"
      variant={variant === 'map' ? 'flat' : 'elevated'}
    >
      {variant === 'list' && imageUri !== undefined ? (
        <PhotoImage
          accessibilityLabel={name}
          className="h-spot-image w-full bg-bg-surface"
          source={imageUri}
        />
      ) : null}

      <SpotBody
        distanceLabel={distanceLabel}
        equipmentText={equipmentText}
        isFavorite={isFavorite}
        name={name}
        onToggleFavorite={onToggleFavorite}
        rating={rating}
        reviewCount={reviewCount}
        status={status}
        verifiedAt={verifiedAt}
      />
    </Card>
  );
}
