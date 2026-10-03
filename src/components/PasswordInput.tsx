import { useState } from 'react';
import { Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { TextInput } from '@/components/Input';
import type { TextInputProps } from '@/components/Input';
import { iconSizeValues, schemePlaceholderColor } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

export type PasswordInputProps = Omit<TextInputProps, 'rightIcon' | 'secureTextEntry'>;

/**
 * A password field with a reveal toggle.
 *
 * The toggle lives here rather than in each screen because the auth screens have to behave
 * identically, and the field starts masked every time: a revealed password left that way is the
 * state a shoulder-surfer is waiting for. The eye's label flips with the state, so a screen reader
 * announces what pressing it will do rather than what the field currently shows.
 *
 * Autocapitalisation and autocorrection are forced off. A password is case-sensitive and is not a
 * word, and a keyboard that capitalises the first letter makes a correct password fail.
 */
export function PasswordInput(props: PasswordInputProps) {
  const scheme = useScheme();
  const [revealed, setRevealed] = useState(false);

  return (
    <TextInput
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      rightIcon={
        <Pressable
          accessibilityLabel={revealed ? t('auth.hidePassword') : t('auth.showPassword')}
          accessibilityRole="button"
          className="p-space-4"
          hitSlop={8}
          onPress={() => setRevealed((current) => !current)}
        >
          <Ionicons
            color={schemePlaceholderColor[scheme]}
            name={revealed ? 'eye-off-outline' : 'eye-outline'}
            size={iconSizeValues.sm}
          />
        </Pressable>
      }
      secureTextEntry={!revealed}
    />
  );
}
