import { NextResponse } from 'next/server';
import { POLICIES_DATA, POLICY_CONTACT_INFO } from '@/data/policies-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedType = searchParams.get('type') || searchParams.get('slug') || searchParams.get('policy');

    // Quick lookup map for aliases (e.g. "terms", "return", "shipping", "privacy")
    const typeMap: Record<string, string> = {
      'terms': 'terms-and-conditions',
      'terms-and-conditions': 'terms-and-conditions',
      'return': 'return-policy',
      'returns': 'return-policy',
      'return-policy': 'return-policy',
      'refund': 'return-policy',
      'cancellation': 'return-policy',
      'shipping': 'shipping-policy',
      'shipping-policy': 'shipping-policy',
      'privacy': 'privacy-policy',
      'privacy-policy': 'privacy-policy',
    };

    if (requestedType) {
      const normalizedKey = typeMap[requestedType.toLowerCase()];
      const policy = normalizedKey ? POLICIES_DATA[normalizedKey] : null;

      if (!policy) {
        return NextResponse.json(
          {
            success: false,
            error: `Policy '${requestedType}' not found. Valid types: terms, return, shipping, privacy`,
            availableTypes: Object.keys(POLICIES_DATA),
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        policy,
        contact: POLICY_CONTACT_INFO,
        lastUpdated: policy.lastUpdated,
      });
    }

    // If no specific type is requested, return all 4 policies with summary list
    const policyList = Object.values(POLICIES_DATA).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      badge: p.badge,
      lastUpdated: p.lastUpdated,
      shortDescription: p.shortDescription,
      sectionsCount: p.sections.length,
    }));

    return NextResponse.json({
      success: true,
      lastUpdated: 'September 2026',
      availablePolicies: policyList,
      policies: POLICIES_DATA,
      contact: POLICY_CONTACT_INFO,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve policy documents',
      },
      { status: 500 }
    );
  }
}
