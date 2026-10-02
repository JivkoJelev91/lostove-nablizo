import { LegalDocument } from '@/features/settings/LegalDocument';
import type { LegalSection } from '@/features/settings/LegalDocument';

const SECTIONS: readonly LegalSection[] = [
  { titleKey: 'legal.terms.acceptTitle', bodyKey: 'legal.terms.acceptBody' },
  { titleKey: 'legal.terms.contentTitle', bodyKey: 'legal.terms.contentBody' },
  { titleKey: 'legal.terms.moderationTitle', bodyKey: 'legal.terms.moderationBody' },
  { titleKey: 'legal.terms.conductTitle', bodyKey: 'legal.terms.conductBody' },
  { titleKey: 'legal.terms.liabilityTitle', bodyKey: 'legal.terms.liabilityBody' },
  { titleKey: 'legal.terms.changesTitle', bodyKey: 'legal.terms.changesBody' },
  { titleKey: 'legal.terms.contactTitle', bodyKey: 'legal.terms.contactBody' },
];

/** The terms of use, reachable from Settings. */
export default function TermsScreen() {
  return (
    <LegalDocument introKey="legal.terms.intro" sections={SECTIONS} titleKey="legal.terms.title" />
  );
}
