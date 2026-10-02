import { useState } from 'react';
import { Pressable, Text, TextInput as RNTextInput, View } from 'react-native';
import type { ReactNode } from 'react';
import type { TextInputProps as RNTextInputProps } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { iconSizeValues, schemePlaceholderColor } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

type FieldFrameProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  children: ReactNode;
  className?: string;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-space-4 font-medium text-caption text-text-secondary">{children}</Text>
  );
}

function FieldMessage({ errorText, helperText }: { errorText?: string; helperText?: string }) {
  if (errorText !== undefined) {
    return <Text className="mt-space-4 font-medium text-caption text-status-bad">{errorText}</Text>;
  }

  if (helperText !== undefined) {
    return (
      <Text className="mt-space-4 font-medium text-caption text-text-muted">{helperText}</Text>
    );
  }

  return null;
}

function FieldFrame({ label, helperText, errorText, children, className }: FieldFrameProps) {
  return (
    <View className={cn('w-full', className)}>
      {label !== undefined ? <FieldLabel>{label}</FieldLabel> : null}
      {children}
      <FieldMessage errorText={errorText} helperText={helperText} />
    </View>
  );
}

type InputShellProps = {
  focused: boolean;
  hasError: boolean;
  disabled: boolean;
  multiline?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
};

function InputShell({
  focused,
  hasError,
  disabled,
  multiline = false,
  leftIcon,
  rightIcon,
  children,
}: InputShellProps) {
  return (
    <View
      className={cn(
        'flex-row gap-space-8 rounded-md border bg-surface-input px-space-12',
        multiline ? 'min-h-input items-start py-space-12' : 'h-input items-center',
        hasError ? 'border-status-bad' : focused ? 'border-primary' : 'border-border',
        disabled && 'opacity-60',
      )}
    >
      {leftIcon !== undefined ? <View accessible={false}>{leftIcon}</View> : null}
      {children}
      {rightIcon !== undefined ? <View accessible={false}>{rightIcon}</View> : null}
    </View>
  );
}

export type TextInputProps = Omit<RNTextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
};

/** A single-line text field with a label, helper text and an error state. */
export function TextInput({
  label,
  helperText,
  errorText,
  disabled,
  leftIcon,
  rightIcon,
  containerClassName,
  editable,
  accessibilityLabel,
  onFocus,
  onBlur,
  ...inputProps
}: TextInputProps) {
  const scheme = useScheme();
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled ?? editable === false;

  return (
    <FieldFrame
      label={label}
      helperText={helperText}
      errorText={errorText}
      className={containerClassName}
    >
      <InputShell
        focused={focused}
        hasError={errorText !== undefined}
        disabled={isDisabled}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      >
        <RNTextInput
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: isDisabled }}
          className="flex-1 py-0 font-regular text-body text-text-primary"
          editable={!isDisabled}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={schemePlaceholderColor[scheme]}
          {...inputProps}
        />
      </InputShell>
    </FieldFrame>
  );
}

export type SearchInputProps = Omit<RNTextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  /** Called when the clear affordance is pressed. */
  onClear?: () => void;
  containerClassName?: string;
};

/** A search field with a leading magnifier and a clear affordance once it holds text. */
export function SearchInput({
  label,
  helperText,
  errorText,
  disabled,
  onClear,
  containerClassName,
  editable,
  value,
  accessibilityLabel,
  onFocus,
  onBlur,
  ...inputProps
}: SearchInputProps) {
  const scheme = useScheme();
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled ?? editable === false;
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <FieldFrame
      label={label}
      helperText={helperText}
      errorText={errorText}
      className={containerClassName}
    >
      <InputShell
        focused={focused}
        hasError={errorText !== undefined}
        disabled={isDisabled}
        leftIcon={
          <Ionicons color={schemePlaceholderColor[scheme]} name="search" size={iconSizeValues.sm} />
        }
        rightIcon={
          hasValue && onClear !== undefined ? (
            <Pressable
              accessibilityLabel={t('common.clearSearch')}
              accessibilityRole="button"
              className="p-space-4"
              hitSlop={8}
              onPress={onClear}
            >
              <Ionicons
                color={schemePlaceholderColor[scheme]}
                name="close-circle"
                size={iconSizeValues.sm}
              />
            </Pressable>
          ) : undefined
        }
      >
        <RNTextInput
          accessibilityLabel={accessibilityLabel ?? t('common.search')}
          accessibilityState={{ disabled: isDisabled }}
          className="flex-1 py-0 font-regular text-body text-text-primary"
          editable={!isDisabled}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={schemePlaceholderColor[scheme]}
          value={value}
          {...inputProps}
        />
      </InputShell>
    </FieldFrame>
  );
}

export type TextAreaProps = Omit<RNTextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  /** Shows a `used/max` counter in the bottom corner. Requires `maxLength`. */
  showCount?: boolean;
  containerClassName?: string;
};

/** A multi-line text field that grows to fit its content. */
export function TextArea({
  label,
  helperText,
  errorText,
  disabled,
  showCount = false,
  containerClassName,
  editable,
  value,
  maxLength,
  accessibilityLabel,
  onFocus,
  onBlur,
  ...inputProps
}: TextAreaProps) {
  const scheme = useScheme();
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled ?? editable === false;
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <FieldFrame
      label={label}
      helperText={helperText}
      errorText={errorText}
      className={containerClassName}
    >
      <InputShell
        focused={focused}
        hasError={errorText !== undefined}
        disabled={isDisabled}
        multiline
      >
        <RNTextInput
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: isDisabled }}
          className="flex-1 py-0 font-regular text-body text-text-primary"
          editable={!isDisabled}
          maxLength={maxLength}
          multiline
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={schemePlaceholderColor[scheme]}
          textAlignVertical="top"
          value={value}
          {...inputProps}
        />
      </InputShell>

      {showCount && maxLength !== undefined ? (
        <Text className="mt-space-4 self-end font-medium text-caption text-text-muted">
          {`${count}/${maxLength}`}
        </Text>
      ) : null}
    </FieldFrame>
  );
}
