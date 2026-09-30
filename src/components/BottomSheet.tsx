import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { cn } from '@/utils/cn';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Hides the grab handle when the sheet is not draggable. */
  showHandle?: boolean;
  className?: string;
};

/** A bottom-anchored sheet over a scrim. Dismisses on backdrop press or the system back gesture. */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  className,
}: BottomSheetProps) {
  const scheme = useScheme();

  return (
    <RNModal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="absolute inset-0 bg-scrim"
          onPress={onClose}
        />

        <SafeAreaView
          accessibilityViewIsModal
          className="rounded-t-xl bg-surface-card-elevated"
          edges={['bottom']}
        >
          <View className={cn('gap-card-gap p-card-pad', className)}>
            {showHandle ? (
              <View accessible={false} className="h-1 w-12 self-center rounded-pill bg-border" />
            ) : null}

            {title !== undefined ? (
              <View className="flex-row items-center justify-between gap-space-12">
                <Text
                  accessibilityRole="header"
                  className="flex-1 font-semibold text-h2 text-text-primary"
                >
                  {title}
                </Text>
                <IconButton
                  accessibilityLabel="Close"
                  icon={
                    <Ionicons
                      color={schemeTextPrimary[scheme]}
                      name="close"
                      size={iconSizeValues.md}
                    />
                  }
                  onPress={onClose}
                />
              </View>
            ) : null}

            {children}
          </View>
        </SafeAreaView>
      </View>
    </RNModal>
  );
}
