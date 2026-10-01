import { Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Rating } from '@/components/Rating';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export type ReviewCardProps = {
  /** Omit on the author's own profile, where repeating their name above every review is noise. */
  authorName?: string;
  /** Avatar source: a remote `{ uri }` or a local `require(...)` asset. */
  avatarUri?: ImageSourcePropType;
  /** The spot the review is about, shown as a heading on the author's own lists. */
  spotName?: string;
  /** Opens the spot. The heading then carries a chevron so it reads as the link. */
  onPress?: () => void;
  rating: number;
  text: string;
  /** e.g. `4 days ago`. */
  dateLabel: string;
  className?: string;
};

/** A single review: the spot it is about, the author, the star rating, the body and the date. */
export function ReviewCard({
  authorName,
  avatarUri,
  spotName,
  onPress,
  rating,
  text,
  dateLabel,
  className,
}: ReviewCardProps) {
  const scheme = useScheme();

  return (
    <Card className={className} onPress={onPress} variant="flat">
      {spotName !== undefined ? (
        <View className="flex-row items-center justify-between gap-space-8">
          <Text className="flex-1 font-semibold text-h3 text-text-primary" numberOfLines={1}>
            {spotName}
          </Text>

          {onPress !== undefined ? (
            <Ionicons
              color={schemeTextMuted[scheme]}
              name="chevron-forward"
              size={iconSizeValues.sm}
            />
          ) : null}
        </View>
      ) : null}

      {authorName !== undefined ? (
        <View className="flex-row items-center gap-space-8">
          <Avatar name={authorName} size="md" uri={avatarUri} />
          <Text className="flex-1 font-semibold text-h3 text-text-primary" numberOfLines={1}>
            {authorName}
          </Text>
        </View>
      ) : null}

      <Rating showValue={false} size="sm" value={rating} />

      {text.length > 0 ? <Text className="text-body text-text-primary">{text}</Text> : null}

      <Text className="text-caption text-text-muted">{dateLabel}</Text>
    </Card>
  );
}
