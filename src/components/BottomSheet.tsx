import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /**
   * When false, backdrop presses, the system back gesture and the close control do nothing.
   * A sheet whose write is in flight sets this so the athlete cannot discard the draft while
   * the request still needs it on screen.
   */
  dismissible?: boolean;
  className?: string;
};

/**
 * A bottom-anchored sheet over a scrim, with a visible close, backdrop and Android-back
 * dismissal.
 *
 * The body scrolls inside a height cap and lifts with the keyboard. Both exist for the same
 * case: a sheet with a text field at the bottom, where the keyboard otherwise covers the field
 * and its submit button, and a tall sheet otherwise grows under the status bar.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  dismissible = true,
  className,
}: BottomSheetProps) {
  const scheme = useScheme();

  return (
    <RNModal
      animationType="slide"
      onRequestClose={dismissible ? onClose : undefined}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        {/* The scrim stays tappable but is hidden from assistive tech: the close control in the
            header is the announced way out, so a screen reader is not offered two of them. */}
        <Pressable
          accessibilityElementsHidden
          accessible={false}
          className="absolute inset-0 bg-scrim"
          importantForAccessibility="no-hide-descendants"
          onPress={dismissible ? onClose : undefined}
        />

        <SafeAreaView
          accessibilityViewIsModal
          className="max-h-[85%] rounded-t-xl bg-surface-card-elevated"
          edges={['bottom']}
        >
          <View className="flex-row items-center justify-between gap-space-12 p-card-pad pb-0">
            {title === undefined ? (
              <View className="flex-1" />
            ) : (
              <Text
                accessibilityRole="header"
                className="flex-1 font-semibold text-h2 text-text-primary"
              >
                {title}
              </Text>
            )}

            <IconButton
              accessibilityLabel={t('common.close')}
              disabled={!dismissible}
              icon={
                <Ionicons color={schemeTextPrimary[scheme]} name="close" size={iconSizeValues.md} />
              }
              onPress={onClose}
            />
          </View>

          <ScrollView
            automaticallyAdjustKeyboardInsets
            className="flex-shrink"
            contentContainerClassName={cn('gap-card-gap p-card-pad', className)}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
