import { Pressable, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { IconButton } from '@/components/IconButton';
import { PhotoImage } from '@/components/PhotoImage';
import { Skeleton } from '@/components/Skeleton';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type PhotoCardProps = {
  /** Image source: a remote `{ uri }` or a local `require(...)` asset. */
  uri: ImageSourcePropType;
  accessibilityLabel?: string;
  onPress?: () => void;
  /** Shows a remove affordance in the corner. */
  onRemove?: () => void;
  loading?: boolean;
  className?: string;
};

/** A square photo tile for grids, with an optional press target and remove affordance. */
export function PhotoCard({
  uri,
  accessibilityLabel,
  onPress,
  onRemove,
  loading = false,
  className,
}: PhotoCardProps) {
  const scheme = useScheme();
  const label = accessibilityLabel ?? t('common.photo');

  return (
    <View className={cn('aspect-square overflow-hidden rounded-lg bg-bg-surface', className)}>
      {loading ? (
        <Skeleton className="h-full w-full rounded-lg" />
      ) : (
        <Pressable
          accessibilityLabel={label}
          accessibilityRole={onPress !== undefined ? 'button' : 'image'}
          className="h-full w-full"
          disabled={onPress === undefined}
          onPress={onPress}
        >
          <PhotoImage accessible={false} className="h-full w-full" source={uri} />
        </Pressable>
      )}

      {onRemove !== undefined && !loading ? (
        <View className="absolute right-space-4 top-space-4">
          <IconButton
            accessibilityLabel={t('common.removePhoto')}
            icon={
              <Ionicons color={schemeTextPrimary[scheme]} name="close" size={iconSizeValues.sm} />
            }
            onPress={onRemove}
            size="sm"
            variant="surface"
          />
        </View>
      ) : null}
    </View>
  );
}
