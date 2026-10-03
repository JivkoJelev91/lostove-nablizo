import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  spacingValues,
  textStyles,
} from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

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
        // A short cross-fade between destinations, so switching tabs reads as a move rather
        // than a cut. `shift` keeps the incoming screen in place while the bar cross-fades.
        animation: 'shift',
        // The scene behind each tab, so the transition never exposes the platform's default
        // white frame in dark mode.
        sceneStyle: { backgroundColor: schemeBackground[scheme] },
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
          paddingTop: spacingValues[8],
          backgroundColor: schemeBackground[scheme],
          borderTopColor: schemeBorder[scheme],
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.nearby'),
          tabBarIcon: tabIcon('navigate', 'navigate-outline'),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: t('nav.favorites'),
          tabBarIcon: tabIcon('heart', 'heart-outline'),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: t('nav.addSpot'),
          // The Add tab keeps its slot in the bar but renders as a filled primary circle, so it
          // reads as the app's main action without floating away from the other destinations.
          // A plus rather than a pin: this button replaces its label, so the glyph alone has to
          // say "add", and a plus is the one mark every thumb already reads that way. A pin said
          // "map" or "near me" instead — the labels of the tabs on either side. The glyph is
          // `plus-thick` from MaterialCommunityIcons rather than Ionicons' `add`, because at 24 px
          // the Ionicons stroke disappears into the filled circle; icon fonts scale their stroke
          // with the glyph, so weight is chosen by the face, not by a font-weight property.
          tabBarButton: ({ accessibilityState, onLongPress, onPress, style }) => (
            <Pressable
              accessibilityLabel={t('nav.addSpotLabel')}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              onLongPress={onLongPress}
              onPress={onPress}
              style={style}
            >
              <View className="flex-1 items-center justify-center">
                <View className="h-control w-control items-center justify-center rounded-pill bg-primary">
                  <MaterialCommunityIcons
                    color={brandColors.onPrimary}
                    name="plus-thick"
                    size={bottomNav.iconSize}
                  />
                </View>
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
