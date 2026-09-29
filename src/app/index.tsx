import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

export default function IndexScreen() {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        content: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.space8,
          paddingHorizontal: theme.layout.screenHorizontalPadding,
        },
        title: {
          ...theme.typography.h1,
          color: theme.colors.text,
        },
        subtitle: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
        accent: {
          width: 48,
          height: 6,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primary,
        },
      }),
    [theme],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.accent} />
        <Text style={styles.title}>Street Fitness</Text>
        <Text style={styles.subtitle}>Discover calisthenics spots near you.</Text>
      </View>
    </SafeAreaView>
  );
}
