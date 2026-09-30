import { Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Rating } from '@/components/Rating';

export type ReviewCardProps = {
  authorName: string;
  /** Avatar source: a remote `{ uri }` or a local `require(...)` asset. */
  avatarUri?: ImageSourcePropType;
  rating: number;
  text: string;
  /** e.g. `4 days ago`. */
  dateLabel: string;
  className?: string;
};

/** A single review: author, star rating, body and date. */
export function ReviewCard({
  authorName,
  avatarUri,
  rating,
  text,
  dateLabel,
  className,
}: ReviewCardProps) {
  return (
    <Card className={className} variant="flat">
      <View className="flex-row items-center gap-space-8">
        <Avatar name={authorName} size="md" uri={avatarUri} />
        <Text className="flex-1 font-semibold text-h3 text-text-primary" numberOfLines={1}>
          {authorName}
        </Text>
      </View>

      <Rating showValue={false} size="sm" value={rating} />

      <Text className="text-body text-text-primary">{text}</Text>

      <Text className="text-caption text-text-muted">{dateLabel}</Text>
    </Card>
  );
}
