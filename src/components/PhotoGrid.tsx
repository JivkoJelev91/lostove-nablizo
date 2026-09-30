import { View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { PhotoCard } from '@/components/PhotoCard';
import { cn } from '@/utils/cn';

export type PhotoGridItem = {
  /** Image source: a remote `{ uri }` or a local `require(...)` asset. */
  uri: ImageSourcePropType;
  accessibilityLabel?: string;
};

export type PhotoGridProps = {
  photos: readonly PhotoGridItem[];
  /** Photos per row. Defaults to two. */
  columns?: number;
  onPressPhoto?: (index: number) => void;
  onRemovePhoto?: (index: number) => void;
  loading?: boolean;
  className?: string;
};

/** Groups items into fixed-length rows so a grid can lay out without measuring the container. */
function toRows<T>(items: readonly T[], columns: number): T[][] {
  const rows: T[][] = [];

  for (const [index, item] of items.entries()) {
    const row = rows[Math.floor(index / columns)];

    if (row === undefined) {
      rows.push([item]);
    } else {
      row.push(item);
    }
  }

  return rows;
}

/**
 * A grid of square {@link PhotoCard} tiles for a spot's photos.
 *
 * Cells are flexible inside fixed-length rows rather than percentage widths, which is what
 * keeps a last row that is not full aligned with the rows above it instead of stretching its
 * single photo across the whole width.
 */
export function PhotoGrid({
  photos,
  columns = 2,
  onPressPhoto,
  onRemovePhoto,
  loading = false,
  className,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return null;
  }

  const perRow = Math.max(1, Math.floor(columns));

  return (
    <View className={cn('gap-space-8', className)}>
      {toRows(photos, perRow).map((row, rowIndex) => (
        <View className="flex-row gap-space-8" key={rowIndex}>
          {row.map((photo, columnIndex) => {
            const index = rowIndex * perRow + columnIndex;

            return (
              <View className="flex-1" key={`${photo.accessibilityLabel ?? 'photo'}-${index}`}>
                <PhotoCard
                  accessibilityLabel={photo.accessibilityLabel}
                  loading={loading}
                  onPress={onPressPhoto === undefined ? undefined : () => onPressPhoto(index)}
                  onRemove={onRemovePhoto === undefined ? undefined : () => onRemovePhoto(index)}
                  uri={photo.uri}
                />
              </View>
            );
          })}

          {/* Empty cells so a part-full last row keeps the column widths of a full one. */}
          {Array.from({ length: perRow - row.length }, (_, filler) => (
            <View className="flex-1" key={`filler-${filler}`} />
          ))}
        </View>
      ))}
    </View>
  );
}
