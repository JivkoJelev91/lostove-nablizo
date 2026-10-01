import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { LoadingSpinner, SecondaryButton } from '@/components';
import { brandColors, iconSizeValues, statusColors } from '@/constants/design-tokens';
import type { Coordinate } from '@/features/spots/types';
import { t } from '@/i18n';

/** What the current attempt is doing, tracked apart from whether a coordinate is captured. */
type CaptureStatus = 'idle' | 'locating' | 'failed';

export type LocationCaptureProps = {
  /** The coordinate the wizard holds, or null until one is captured. */
  coordinate: Coordinate | null;
  onCapture: (coordinate: Coordinate) => void;
};

/**
 * Stands in for the map pin: reads the device's position instead of asking the user to place a
 * pin, so a spot lands where its contributor is standing.
 *
 * The wizard owns the captured coordinate and this component owns the attempt — asking for
 * permission, requesting a fix, and saying why it could not. That split keeps a re-render of
 * the step from discarding the coordinate, which is what the map picker used to hold.
 */
export function LocationCapture({ coordinate, onCapture }: LocationCaptureProps) {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [failure, setFailure] = useState<string | null>(null);

  const capture = useCallback(async () => {
    setStatus('locating');
    setFailure(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setStatus('failed');
        setFailure(t('location.permissionDenied'));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      onCapture({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setStatus('idle');
    } catch {
      setStatus('failed');
      setFailure(t('location.failedPosition'));
    }
  }, [onCapture]);

  if (status === 'locating') {
    return <LoadingSpinner label={t('location.capturing')} />;
  }

  if (status === 'failed') {
    return (
      <View className="gap-space-8">
        <View className="flex-row items-start gap-space-8">
          <Ionicons color={statusColors.bad} name="alert-circle" size={iconSizeValues.sm} />
          <Text className="flex-1 text-bodySmall text-text-secondary">{failure}</Text>
        </View>

        <SecondaryButton fullWidth label={t('common.tryAgain')} onPress={capture} />
      </View>
    );
  }

  if (coordinate !== null) {
    return (
      <View className="h-control flex-row items-center justify-center gap-space-8 rounded-pill border border-border bg-bg-surface px-space-16">
        <Ionicons color={statusColors.good} name="checkmark-circle" size={iconSizeValues.sm} />
        <Text className="font-semibold text-body text-text-primary">{t('location.captured')}</Text>
      </View>
    );
  }

  return (
    <SecondaryButton
      fullWidth
      label={t('location.capture')}
      leftIcon={<Ionicons color={brandColors.primary} name="location" size={iconSizeValues.sm} />}
      onPress={capture}
    />
  );
}
