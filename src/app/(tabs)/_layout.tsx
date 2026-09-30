import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  bottomNav,
  brandColors,
  fontFamilies,
  schemeBackground,
  schemeBorder,
  schemeTextMuted,
  textStyles,
} from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
};

function tabIcon(
  focusedName: keyof typeof Ionicons.glyphMap,
  idleName: keyof typeof Ionicons.glyphMap,
) {
  return function TabIcon({ color, focused }: TabIconProps) {
    return (
      <Ionicons color={color} name={focused ? focusedName : idleName} size={bottomNav.iconSize} />
    );
  };
}

/** The bar's four destinations. The existing screens each provide their own content. */
export default function TabsLayout() {
  const scheme = useScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // The forms in the tabs need the whole screen while the keyboard is up.
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: brandColors.primary,
        tabBarInactiveTintColor: schemeTextMuted[scheme],
        tabBarLabelStyle: {
          fontFamily: fontFamilies.medium,
          fontSize: textStyles.caption.fontSize,
          lineHeight: textStyles.caption.lineHeight,
        },
        // The bar adds the bottom inset itself, so the height token only covers the content.
        tabBarStyle: {
          height: bottomNav.height + insets.bottom,
          paddingTop: 8,
          backgroundColor: schemeBackground[scheme],
          borderTopColor: schemeBorder[scheme],
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: tabIcon('map', 'map-outline'),
        }}
      />

      {/* Registered but kept out of the bar: the real map ships in a later phase. */}
      <Tabs.Screen name="map" options={{ href: null }} />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: tabIcon('heart', 'heart-outline'),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          // The Add tab keeps its slot in the bar but renders as a filled primary circle, so it
          // reads as the app's main action without floating away from the other destinations.
          tabBarButton: ({ accessibilityState, onLongPress, onPress, style }) => (
            <Pressable
              accessibilityLabel="Add a spot"
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              onLongPress={onLongPress}
              onPress={onPress}
              style={style}
            >
              <View className="flex-1 items-center justify-center">
                <View className="h-12 w-12 items-center justify-center rounded-pill bg-primary">
                  <Ionicons color={brandColors.onPrimary} name="add" size={bottomNav.iconSize} />
                </View>
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
