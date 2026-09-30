import { Text, View } from 'react-native';

import { Card, Divider, ScreenShell } from '@/components';

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-space-12">
      <Text className="text-body text-text-primary">{label}</Text>
      <Text className="text-bodySmall text-text-secondary">{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <ScreenShell description="Notifications, units and appearance" scroll title="Settings">
      <Card gap="md">
        <SettingRow label="Notifications" value="On" />
        <Divider />
        <SettingRow label="Units" value="Metric" />
        <Divider />
        <SettingRow label="Appearance" value="Follows system" />
      </Card>
    </ScreenShell>
  );
}
