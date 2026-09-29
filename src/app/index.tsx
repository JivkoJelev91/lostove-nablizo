import { Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-space-8 bg-bg-main px-screen-px">
      <View className="h-1.5 w-12 rounded-pill bg-primary" />
      <Text className="font-bold text-h1 text-text-primary">Street Fitness</Text>
      <Text className="text-center text-bodySmall text-text-secondary">
        Discover calisthenics spots near you.
      </Text>
    </View>
  );
}
