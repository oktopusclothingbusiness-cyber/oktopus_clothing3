'use client';

import { POLICIES_DATA } from '@/data/policies-content';
import { PolicyView } from '@/components/policies/policy-view';

export default function PrivacyPolicyPage() {
  const policy = POLICIES_DATA['privacy-policy'];
  return <PolicyView policy={policy} />;
}
