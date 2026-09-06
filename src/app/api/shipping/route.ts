import { NextRequest } from 'next/server';
import { GET as mobileShippingGET } from '@/app/api/mobile/shipping/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return mobileShippingGET(request);
}
