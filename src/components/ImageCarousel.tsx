import { useState } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import type { ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PhotoImage } from '@/components/PhotoImage';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

type CarouselSlideProps = {
  source: ImageSourcePropType;
  label: string;
  heightClassName: string;
  width: number;
};

/** True for a photo that has to be fetched, which is the only kind with a load worth hiding. */
function isRemote(source: ImageSourcePropType): boolean {
  return typeof source === 'object' && source !== null && 'uri' in source;
}

/** One frame: a bundled asset paints immediately, a fetched one fades in when it arrives. */
function CarouselSlide({ source, label, heightClassName, width }: CarouselSlideProps) {
  const opacity = useSharedValue(isRemote(source) ? 0 : 1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // The frame is sized by a plain view so the height token applies on a device; the animated
  // view inside it only carries the fade. An animated component never takes `className`.
  return (
    <View className={cn('bg-bg-surface', heightClassName)} style={{ width }}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        <PhotoImage
          accessibilityLabel={label}
          className="h-full w-full"
          onLoad={() => {
            opacity.set(withTiming(1, { duration: 180, reduceMotion: ReduceMotion.System }));
          }}
          source={source}
        />
      </Animated.View>
    </View>
  );
}

export type ImageCarouselProps = {
  images: readonly ImageSourcePropType[];
  /** Describes the subject; each slide gets `снимка n от m` appended. */
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
      <PhotoImage
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

  const subject = accessibilityLabel ?? t('spot.photoSubject');

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
          <CarouselSlide
            heightClassName={heightClassName}
            label={t('spot.photoOf', {
              subject,
              index: itemIndex + 1,
              total: images.length,
            })}
            source={item}
            width={width}
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
