import { useState } from 'react';
import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { SearchInput, TextArea, TextInput } from '@/components';
import { GalleryGroup, GalleryScreen } from '@/components/gallery/GalleryScreen';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';

export default function InputsGalleryScreen() {
  const [name, setName] = useState('');
  const [query, setQuery] = useState('Trakia');
  const [notes, setNotes] = useState('Bars are in good shape. Surface is rubber.');

  return (
    <GalleryScreen
      description="48px fields with a label, helper text, focus ring and error state."
      title="Inputs"
    >
      <GalleryGroup title="Text input">
        <TextInput
          helperText="Shown under the field when there is no error."
          label="Spot name"
          onChangeText={setName}
          placeholder="e.g. Trakia Fitness Park"
          value={name}
        />

        <TextInput
          errorText="That name is already taken."
          label="Error"
          onChangeText={setName}
          value={name}
        />

        <TextInput disabled helperText="Cannot be edited." label="Disabled" value="Locked value" />

        <TextInput
          label="With a leading icon"
          leftIcon={
            <Ionicons color={brandColors.primary} name="location" size={iconSizeValues.sm} />
          }
          onChangeText={setName}
          placeholder="Nearby"
          value={name}
        />
      </GalleryGroup>

      <GalleryGroup title="Search input">
        <SearchInput
          helperText="Type to see the clear affordance."
          label="Search spots"
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search equipment, areas…"
          value={query}
        />

        <SearchInput disabled label="Disabled" placeholder="Unavailable" value="Locked search" />
      </GalleryGroup>

      <GalleryGroup title="Text area">
        <TextArea
          helperText="Share details that help other athletes."
          label="Notes"
          maxLength={140}
          onChangeText={setNotes}
          placeholder="Anything worth knowing…"
          showCount
          value={notes}
        />

        <View>
          <TextArea
            errorText="Please write at least 20 characters."
            label="Error"
            onChangeText={setNotes}
            value={notes}
          />
        </View>
      </GalleryGroup>
    </GalleryScreen>
  );
}
