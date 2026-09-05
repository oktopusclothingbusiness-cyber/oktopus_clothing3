'use client';

import { POLICIES_DATA } from '@/data/policies-content';
import { PolicyView } from '@/components/policies/policy-view';

export default function ShippingPolicyPage() {
  const policy = POLICIES_DATA['shipping-policy'];
  return <PolicyView policy={policy} />;
}
