import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';

import { IconButton } from '@/components/IconButton';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  /** Action buttons, laid out right-aligned in a row. */
  actions?: ReactNode;
  /** When false the backdrop no longer dismisses the modal. Defaults to true. */
  dismissOnBackdropPress?: boolean;
  className?: string;
};

/** A centred dialog over a scrim, with an optional title, body and action row. */
export function Modal({
  visible,
  onClose,
  title,
  description,
  children,
  actions,
  dismissOnBackdropPress = true,
  className,
}: ModalProps) {
  const scheme = useScheme();

  return (
    <RNModal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 items-center justify-center px-screen-px">
        {/* Hidden from assistive tech whichever mode it is in: when it dismisses, the close
            control in the header is the announced way out, and when it does not, a focusable
            backdrop that does nothing would be worse than none. */}
        <Pressable
          accessibilityElementsHidden
          accessible={false}
          className="absolute inset-0 bg-scrim"
          importantForAccessibility="no-hide-descendants"
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />

        <View
          accessibilityViewIsModal
          className={cn(
            'w-full gap-card-gap-lg rounded-xl bg-surface-card-elevated p-card-pad shadow-card-elevated',
            className,
          )}
        >
          <View className="flex-row items-start justify-between gap-space-12">
            <View className="flex-1 gap-space-4">
              {title !== undefined ? (
                <Text
                  accessibilityRole="header"
                  className="font-semibold text-h2 text-text-primary"
                >
                  {title}
                </Text>
              ) : null}
              {description !== undefined ? (
                <Text className="text-bodySmall text-text-secondary">{description}</Text>
              ) : null}
            </View>

            <IconButton
              accessibilityLabel={t('common.close')}
              icon={
                <Ionicons color={schemeTextPrimary[scheme]} name="close" size={iconSizeValues.md} />
              }
              onPress={onClose}
            />
          </View>

          {children}

          {actions !== undefined ? (
            <View className="flex-row items-center justify-end gap-space-8">{actions}</View>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
}
