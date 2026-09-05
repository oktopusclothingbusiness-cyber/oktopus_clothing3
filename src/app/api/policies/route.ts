import { GET as mobilePoliciesGET } from '@/app/api/mobile/policies/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return mobilePoliciesGET(request);
}
