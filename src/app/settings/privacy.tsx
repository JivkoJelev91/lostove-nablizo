import { LegalDocument } from '@/features/settings/LegalDocument';
import type { LegalSection } from '@/features/settings/LegalDocument';

const SECTIONS: readonly LegalSection[] = [
  { titleKey: 'legal.privacy.dataTitle', bodyKey: 'legal.privacy.dataBody' },
  { titleKey: 'legal.privacy.locationTitle', bodyKey: 'legal.privacy.locationBody' },
  { titleKey: 'legal.privacy.photosTitle', bodyKey: 'legal.privacy.photosBody' },
  { titleKey: 'legal.privacy.storageTitle', bodyKey: 'legal.privacy.storageBody' },
  { titleKey: 'legal.privacy.sharingTitle', bodyKey: 'legal.privacy.sharingBody' },
  { titleKey: 'legal.privacy.retentionTitle', bodyKey: 'legal.privacy.retentionBody' },
  { titleKey: 'legal.privacy.contactTitle', bodyKey: 'legal.privacy.contactBody' },
];

/** The privacy policy, reachable from Settings. */
export default function PrivacyScreen() {
  return (
    <LegalDocument
      introKey="legal.privacy.intro"
      sections={SECTIONS}
      titleKey="legal.privacy.title"
    />
  );
}
