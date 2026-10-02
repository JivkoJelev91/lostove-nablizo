import { Pressable, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  brandColors,
  iconSizeValues,
  schemeTextPrimary,
  schemeTextSecondary,
} from '@/constants/design-tokens';
import { EQUIPMENT_ICONS } from '@/features/spots/equipment-icons';
import type { EquipmentName } from '@/features/spots/equipment-icons';
import {
  changeEquipmentQuantity,
  EQUIPMENT_CATALOGUE,
  MAX_EQUIPMENT_QUANTITY,
  toggleEquipment,
} from '@/features/spot-editor/equipment-draft';
import type { EquipmentDraftItem } from '@/features/spot-editor/types';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { equipmentLabel } from '@/i18n/equipment';
import { cn } from '@/utils/cn';

export type EquipmentQuantityGridProps = {
  value: readonly EquipmentDraftItem[];
  onChange: (items: readonly EquipmentDraftItem[]) => void;
  errorText?: string;
  className?: string;
};

type QuantityStepperProps = {
  name: EquipmentName;
  quantity: number;
  onQuantity: (delta: number) => void;
};

/**
 * The `− 2 +` control on a selected tile.
 *
 * The press stops there instead of reaching the card, so a stepper never doubles as the
 * tile's select toggle.
 */
function QuantityStepper({ name, quantity, onQuantity }: QuantityStepperProps) {
  const scheme = useScheme();

  const stepButton = (
    accessibilityLabel: string,
    disabled: boolean,
    iconName: 'add' | 'remove',
    delta: number,
  ) => (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={cn(
        'h-icon-lg w-icon-lg items-center justify-center rounded-pill bg-bg-main',
        disabled && 'opacity-50',
      )}
      disabled={disabled}
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation();
        onQuantity(delta);
      }}
    >
      <Ionicons color={schemeTextPrimary[scheme]} name={iconName} size={iconSizeValues.sm} />
    </Pressable>
  );

  return (
    <View className="flex-row items-center justify-between">
      {stepButton(
        t('equipmentStep.decrease', { name: equipmentLabel(name) }),
        quantity <= 1,
        'remove',
        -1,
      )}
      <Text className="font-semibold text-body text-text-primary">{quantity}</Text>
      {stepButton(
        t('equipmentStep.increase', { name: equipmentLabel(name) }),
        quantity >= MAX_EQUIPMENT_QUANTITY,
        'add',
        1,
      )}
    </View>
  );
}

type EquipmentTileProps = {
  name: EquipmentName;
  item: EquipmentDraftItem | undefined;
  onToggle: () => void;
  onQuantity: (delta: number) => void;
};

function EquipmentTile({ name, item, onToggle, onQuantity }: EquipmentTileProps) {
  const scheme = useScheme();
  const Icon = EQUIPMENT_ICONS[name];
  const selected = item !== undefined;

  return (
    <Pressable
      accessibilityHint={selected ? t('equipmentStep.removeHint') : t('equipmentStep.addHint')}
      accessibilityLabel={equipmentLabel(name)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'gap-space-8 rounded-lg border p-card-pad',
        selected
          ? 'border-primary bg-bg-surface'
          : 'border-border bg-surface-card active:bg-bg-surface',
      )}
      onPress={onToggle}
    >
      <View className="flex-row items-center gap-space-8">
        <Icon
          color={selected ? brandColors.primary : schemeTextSecondary[scheme]}
          size={iconSizeValues.sm}
        />
        <Text className="flex-1 font-semibold text-bodySmall text-text-primary" numberOfLines={1}>
          {equipmentLabel(name)}
        </Text>
      </View>

      {item === undefined ? (
        <Text className="text-caption text-text-muted">{t('equipmentStep.tapToAdd')}</Text>
      ) : (
        <QuantityStepper name={name} onQuantity={onQuantity} quantity={item.quantity} />
      )}
    </Pressable>
  );
}

/**
 * The equipment picker: every catalogue item as a tile that toggles on tap and, once picked,
 * carries its own quantity stepper.
 */
export function EquipmentQuantityGrid({
  value,
  onChange,
  errorText,
  className,
}: EquipmentQuantityGridProps) {
  const rows: EquipmentName[][] = [];

  for (const [index, name] of EQUIPMENT_CATALOGUE.entries()) {
    const rowIndex = Math.floor(index / 2);
    const row = rows[rowIndex];

    if (row === undefined) {
      rows.push([name]);
    } else {
      row.push(name);
    }
  }

  return (
    <View className={cn('gap-space-8', className)}>
      {rows.map((row, rowIndex) => (
        <View className="flex-row gap-space-8" key={rowIndex}>
          {row.map((name) => (
            <View className="flex-1" key={name}>
              <EquipmentTile
                item={value.find((entry) => entry.name === name)}
                name={name}
                onQuantity={(delta) => onChange(changeEquipmentQuantity(value, name, delta))}
                onToggle={() => onChange(toggleEquipment(value, name))}
              />
            </View>
          ))}

          {/* A part-full last row keeps the column widths of a full one. */}
          {row.length % 2 === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}

      {errorText !== undefined ? (
        <Text className="text-caption text-status-bad">{errorText}</Text>
      ) : null}
    </View>
  );
}
