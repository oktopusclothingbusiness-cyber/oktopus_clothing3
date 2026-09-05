'use client';

import { POLICIES_DATA } from '@/data/policies-content';
import { PolicyView } from '@/components/policies/policy-view';

export default function TermsAndConditionsPage() {
  const policy = POLICIES_DATA['terms-and-conditions'];
  return <PolicyView policy={policy} />;
}
