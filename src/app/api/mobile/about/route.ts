import { NextResponse } from 'next/server';
import { GET as getAboutData } from '@/app/api/about/route';

export async function GET() {
  return getAboutData();
}
