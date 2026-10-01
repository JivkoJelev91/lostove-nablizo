import { useState } from 'react';
import { FlatList, Image, Text, View, useWindowDimensions } from 'react-native';
import type { ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { cn } from '@/utils/cn';

export type ImageCarouselProps = {
  images: readonly ImageSourcePropType[];
  /** Describes the subject; each slide gets `photo n of m` appended. */
  accessibilityLabel?: string;
  /** Height token shared by every slide, e.g. `h-spot-hero`. */
  heightClassName?: string;
  className?: string;
};

/**
 * The spot's photos as a swipeable gallery.
 *
 * A single image renders exactly as a plain hero image — no counter, nothing to swipe — because
 * gallery controls over one frame are noise. Two or more get a paging list with a `2 / 3`
 * position badge in the corner.
 */
export function ImageCarousel({
  images,
  accessibilityLabel,
  heightClassName = 'h-spot-hero',
  className,
}: ImageCarouselProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const first = images[0];

  if (first === undefined) {
    return null;
  }

  if (images.length === 1) {
    return (
      <Image
        accessibilityLabel={accessibilityLabel}
        className={cn('w-full bg-bg-surface', heightClassName)}
        source={first}
      />
    );
  }

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
    setIndex(Math.min(Math.max(next, 0), images.length - 1));
  };

  const subject = accessibilityLabel ?? 'Spot';

  return (
    <View className={cn('relative w-full', className)}>
      <FlatList
        data={images}
        getItemLayout={(_, itemIndex) => ({
          index: itemIndex,
          length: width,
          offset: width * itemIndex,
        })}
        horizontal
        keyExtractor={(_, itemIndex) => String(itemIndex)}
        onMomentumScrollEnd={handleMomentumEnd}
        pagingEnabled
        renderItem={({ item, index: itemIndex }) => (
          <Image
            accessibilityLabel={`${subject} photo ${itemIndex + 1} of ${images.length}`}
            className={cn('bg-bg-surface', heightClassName)}
            source={item}
            style={{ width }}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View
        accessible={false}
        className="absolute bottom-space-12 right-space-12 rounded-pill bg-scrim px-space-8 py-space-4"
        pointerEvents="none"
      >
        <Text className="font-medium text-caption text-text-on-secondary">
          {`${Math.min(index + 1, images.length)} / ${images.length}`}
        </Text>
      </View>
    </View>
  );
}
