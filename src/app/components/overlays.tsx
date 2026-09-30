import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet, Modal, PrimaryButton, SecondaryButton, TextInput } from '@/components';
import { GalleryGroup, GalleryRow, GalleryScreen } from '@/components/gallery/GalleryScreen';

export default function OverlaysGalleryScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [sheetName, setSheetName] = useState('');

  return (
    <>
      <GalleryScreen
        description="Overlays rendered with the scrim token, and the Screen container itself."
        title="Overlays & layout"
      >
        <GalleryGroup title="Bottom sheet">
          <GalleryRow label="Slide-in sheet with a title and body">
            <PrimaryButton label="Open bottom sheet" onPress={() => setSheetOpen(true)} />
          </GalleryRow>
        </GalleryGroup>

        <GalleryGroup title="Modal">
          <GalleryRow label="Centered dialog">
            <SecondaryButton label="Open modal" onPress={() => setModalOpen(true)} />
            <SecondaryButton
              label="Open non-dismissible"
              onPress={() => setLockedModalOpen(true)}
            />
          </GalleryRow>
        </GalleryGroup>

        <GalleryGroup title="Screen">
          <View className="gap-space-8">
            <TextInput
              helperText="Every gallery screen is wrapped in Screen, which owns the safe area, background and 16px horizontal padding."
              label="Focus anywhere"
              onChangeText={setSheetName}
              placeholder="Type to test the keyboard"
              value={sheetName}
            />
          </View>
        </GalleryGroup>
      </GalleryScreen>

      <BottomSheet onClose={() => setSheetOpen(false)} title="Share this spot" visible={sheetOpen}>
        <View className="gap-space-12">
          <TextInput
            label="Add a note"
            onChangeText={setSheetName}
            placeholder="Optional message"
            value={sheetName}
          />
          <View className="flex-row justify-end gap-space-8">
            <SecondaryButton label="Cancel" onPress={() => setSheetOpen(false)} size="sm" />
            <PrimaryButton label="Share" onPress={() => setSheetOpen(false)} size="sm" />
          </View>
        </View>
      </BottomSheet>

      <Modal
        actions={
          <>
            <SecondaryButton label="Cancel" onPress={() => setModalOpen(false)} size="sm" />
            <PrimaryButton label="Confirm" onPress={() => setModalOpen(false)} size="sm" />
          </>
        }
        description="This is the modal body. It can hold anything, and the actions sit right-aligned at the bottom."
        onClose={() => setModalOpen(false)}
        title="Delete this spot?"
        visible={modalOpen}
      >
        <View className="h-2 w-3/4 rounded-pill bg-bg-surface" />
      </Modal>

      <Modal
        description="The backdrop does not dismiss this one — use the close button."
        onClose={() => setLockedModalOpen(false)}
        title="Required action"
        visible={lockedModalOpen}
      />
    </>
  );
}
