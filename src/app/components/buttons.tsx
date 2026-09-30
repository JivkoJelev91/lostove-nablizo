import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  DangerButton,
  GhostButton,
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from '@/components';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';
import { iconSizeValues, schemeTextPrimary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

function IconPreview() {
  const scheme = useScheme();
  return <Ionicons color={schemeTextPrimary[scheme]} name="navigate" size={iconSizeValues.sm} />;
}

export default function ButtonsGalleryScreen() {
  const scheme = useScheme();

  return (
    <GalleryScreen
      description="Pill buttons, 48px tall (36px small), with loading and disabled states."
      title="Buttons"
    >
      <GalleryGroup title="Variants">
        <GalleryRow label="Default">
          <PrimaryButton label="Navigate" leftIcon={<IconPreview />} />
        </GalleryRow>

        <GalleryRow label="Small">
          <PrimaryButton label="Navigate" size="sm" />
          <SecondaryButton label="Filters" size="sm" />
        </GalleryRow>

        <GalleryRow label="Full width">
          <View className="w-full">
            <PrimaryButton fullWidth label="Start workout" />
          </View>
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="States">
        <GalleryRow label="Loading">
          <PrimaryButton label="Saving" loading />
          <SecondaryButton label="Saving" loading />
          <DangerButton label="Deleting" loading />
        </GalleryRow>

        <GalleryRow label="Disabled">
          <PrimaryButton disabled label="Navigate" />
          <SecondaryButton disabled label="Filters" />
          <GhostButton disabled label="Later" />
          <DangerButton disabled label="Delete" />
        </GalleryRow>
      </GalleryGroup>

      <GalleryGroup title="Icon button">
        <GalleryRow label="Variants">
          <IconButton
            accessibilityLabel="Navigate"
            icon={
              <Ionicons
                color={schemeTextPrimary[scheme]}
                name="navigate"
                size={iconSizeValues.sm}
              />
            }
            variant="primary"
          />
          <IconButton
            accessibilityLabel="Settings"
            icon={
              <Ionicons
                color={schemeTextPrimary[scheme]}
                name="settings-outline"
                size={iconSizeValues.sm}
              />
            }
            variant="surface"
          />
          <IconButton
            accessibilityLabel="Close"
            icon={
              <Ionicons color={schemeTextPrimary[scheme]} name="close" size={iconSizeValues.sm} />
            }
            variant="ghost"
          />
          <IconButton
            accessibilityLabel="Delete"
            icon={
              <Ionicons
                color={schemeTextPrimary[scheme]}
                name="trash-outline"
                size={iconSizeValues.sm}
              />
            }
            variant="danger"
          />
        </GalleryRow>

        <GalleryRow label="Sizes">
          <IconButton
            accessibilityLabel="Small"
            icon={
              <Ionicons color={schemeTextPrimary[scheme]} name="add" size={iconSizeValues.xs} />
            }
            size="sm"
            variant="surface"
          />
          <IconButton
            accessibilityLabel="Medium"
            icon={
              <Ionicons color={schemeTextPrimary[scheme]} name="add" size={iconSizeValues.sm} />
            }
            size="md"
            variant="surface"
          />
          <IconButton
            accessibilityLabel="Large"
            icon={
              <Ionicons color={schemeTextPrimary[scheme]} name="add" size={iconSizeValues.md} />
            }
            size="lg"
            variant="surface"
          />
        </GalleryRow>

        <GalleryRow label="Loading and disabled">
          <IconButton accessibilityLabel="Loading" icon={<></>} loading variant="surface" />
          <IconButton
            accessibilityLabel="Disabled"
            icon={
              <Ionicons color={schemeTextPrimary[scheme]} name="add" size={iconSizeValues.sm} />
            }
            disabled
            variant="surface"
          />
        </GalleryRow>
      </GalleryGroup>
    </GalleryScreen>
  );
}
