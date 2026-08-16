import { NextRequest, NextResponse } from 'next/server';
import { validateNextMobileHeaders } from '@/lib/mobileSecurityNext';

function isVersionLower(current: string, minimum: string): boolean {
  const c = (current || '0.0.0').split('.').map(Number);
  const m = (minimum || '0.0.0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const cv = c[i] || 0;
    const mv = m[i] || 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const headerCheck = await validateNextMobileHeaders(request);
    if (!headerCheck.valid) return headerCheck.response!;

    const searchParams = request.nextUrl.searchParams;
    const platform = (searchParams.get('platform') || request.headers.get('x-platform') || '').toLowerCase();
    const version = searchParams.get('version') || '1.0.0';

    const minSupportedVersion = '1.0.0';
    const latestVersion = '1.0.4';
    const forceUpdate = isVersionLower(version, minSupportedVersion);

    const updateUrl =
      platform === 'ios'
        ? 'https://apps.apple.com/app/oktopus-clothing/id123456789'
        : 'https://play.google.com/store/apps/details?id=com.oktopus.clothing';

    return NextResponse.json(
      {
        forceUpdate,
        latestVersion,
        minSupportedVersion,
        maintenanceMode: false,
        updateUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('App Version Config Error:', error);
    return NextResponse.json({ message: 'Failed to retrieve app version configuration.' }, { status: 500 });
  }
}
