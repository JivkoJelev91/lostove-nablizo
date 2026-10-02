import { useState } from 'react';
import { Image, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { iconSizeValues, schemeTextSecondary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { cn } from '@/utils/cn';

export type PhotoImageProps = {
  source: ImageSourcePropType;
  className?: string;
  accessibilityLabel?: string;
  accessible?: boolean;
  onLoad?: () => void;
};

/**
 * A photo that keeps its frame when the fetch fails.
 *
 * A stored photo can disappear — a row is deleted, a cached list is a moment stale, the phone is
 * offline — and a bare `Image` answers with a blank hole the size of the layout. This paints a
 * muted placeholder glyph in the same frame instead, so a broken URL reads as "no photo" rather
 * than as a rendering bug. A bundled or local file simply never takes the failure path.
 */
export function PhotoImage({
  source,
  className,
  accessibilityLabel,
  accessible,
  onLoad,
}: PhotoImageProps) {
  const scheme = useScheme();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        className={cn('items-center justify-center bg-bg-surface', className)}
      >
        <Ionicons
          color={schemeTextSecondary[scheme]}
          name="image-outline"
          size={iconSizeValues.md}
        />
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      accessible={accessible}
      className={className}
      onError={() => setFailed(true)}
      onLoad={onLoad}
      source={source}
    />
  );
}
