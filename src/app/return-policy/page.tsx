'use client';

import { POLICIES_DATA } from '@/data/policies-content';
import { PolicyView } from '@/components/policies/policy-view';

export default function ReturnPolicyPage() {
  const policy = POLICIES_DATA['return-policy'];
  return <PolicyView policy={policy} />;
}
