import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useKeyboardLift } from '@/hooks/useKeyboardLift';
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
  /**
   * The sheet's action, pinned below the scrolling body instead of being its last child.
   *
   * A sheet that ends in a submit button has one element that must be reachable no matter how
   * little room is left, and the room left is least when the keyboard is up. Putting the button in
   * the body makes that depend on the body having been scrolled to the end; pinning it makes it
   * depend on nothing.
   */
  footer?: ReactNode;
};

/**
 * A bottom-anchored sheet over a scrim, with a visible close, backdrop and Android-back
 * dismissal.
 *
 * The body scrolls inside a height cap, an optional footer stays put below it, and the whole sheet
 * lifts with the keyboard. All three exist for the same case: a sheet with a text field and an
 * action at the bottom, where the keyboard otherwise covers the field and its submit button, and a
 * tall sheet otherwise grows under the status bar.
 *
 * Each platform gets the lift its own way. iOS has `KeyboardAvoidingView`. The Android sheet is a
 * separate edge-to-edge window that `adjustResize` no longer shrinks, so the sheet moves by the
 * lift the hook measures against its own bottom edge, and the cap follows it down so a tall sheet
 * reaches the keyboard instead of running off the top of the screen. The lift leaves the body
 * short, so a field near its end can end up above the fold: the body scrolls itself down once the
 * lift has been laid out. That runs on layout rather than on a frame, because a scroll measured
 * before the new height lands stops short of the field.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  dismissible = true,
  className,
  footer,
}: BottomSheetProps) {
  const scheme = useScheme();
  const [anchorBottom, setAnchorBottom] = useState(0);
  const keyboardLift = useKeyboardLift(anchorBottom);
  const lifted = keyboardLift > 0;
  const bodyRef = useRef<ScrollView>(null);

  const revealBodyEnd = useCallback(() => {
    if (!lifted) {
      return;
    }

    // Not animated: the lift itself is not, and the two land in the same frame, so animating one
    // and not the other reads as a jump anyway.
    bodyRef.current?.scrollToEnd({ animated: false });
  }, [lifted]);

  useEffect(() => {
    if (!lifted) {
      return;
    }

    // The body's own layout pass is the reliable signal, but the fast path costs a frame and
    // covers the case where the sheet is already resting at its end.
    const frame = requestAnimationFrame(revealBodyEnd);

    return () => cancelAnimationFrame(frame);
  }, [lifted, revealBodyEnd]);

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
        // The lift is measured against this surface's own bottom, because the window this sheet
        // lives in is not the window `useWindowDimensions` reads.
        onLayout={(event) => {
          const { y, height } = event.nativeEvent.layout;
          setAnchorBottom(y + height);
        }}
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
          // The keyboard is the bottom edge while it is up, so the home indicator's inset would
          // only add empty space above it. The height cap becomes the space above the keyboard:
          // a share of the screen is meaningless once most of it is gone.
          edges={lifted ? [] : ['bottom']}
          style={
            lifted
              ? {
                  marginBottom: keyboardLift,
                  maxHeight: Math.max(0, anchorBottom - keyboardLift),
                }
              : undefined
          }
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
            ref={bodyRef}
            automaticallyAdjustKeyboardInsets
            className="flex-shrink"
            contentContainerClassName={cn('gap-card-gap p-card-pad', className)}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onLayout={revealBodyEnd}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer === undefined ? null : (
            <View className="gap-card-gap px-card-pad pb-card-pad pt-0">{footer}</View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
