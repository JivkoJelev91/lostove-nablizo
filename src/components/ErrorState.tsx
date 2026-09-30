import { Ionicons } from '@expo/vector-icons';

import { SecondaryButton } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { iconSizeValues, statusColors } from '@/constants/design-tokens';

export type ErrorStateProps = {
  title?: string;
  description?: string;
  /** When provided, renders a retry button. */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

/**
 * A failure placeholder. It composes {@link EmptyState} so the two share one layout and
 * differ only in icon colour and the presence of a retry action.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      action={
        onRetry !== undefined ? <SecondaryButton label={retryLabel} onPress={onRetry} /> : undefined
      }
      className={className}
      description={description}
      icon={
        <Ionicons color={statusColors.bad} name="alert-circle-outline" size={iconSizeValues.md} />
      }
      title={title}
    />
  );
}
