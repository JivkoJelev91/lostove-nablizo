import { View } from 'react-native';

import { PrimaryButton, ScreenShell, TextArea, TextInput } from '@/components';

export default function AddSpotScreen() {
  return (
    <ScreenShell
      description="Pin a new calisthenics spot for the community"
      scroll
      title="Add a spot"
      variant="tab"
    >
      <View className="gap-space-12">
        <TextInput label="Spot name" placeholder="e.g. Trakia Fitness Park" />
        <TextInput label="Address" placeholder="Street or nearest landmark" />
        <TextArea
          label="Equipment"
          maxLength={140}
          placeholder="Pull-up bars, dips, rings..."
          showCount
        />
      </View>

      <PrimaryButton label="Submit spot" onPress={() => {}} />
    </ScreenShell>
  );
}
