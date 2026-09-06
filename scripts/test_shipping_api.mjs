import { GET } from '../src/app/api/mobile/shipping/route.ts';
import { GET as universalGET } from '../src/app/api/shipping/route.ts';

console.log('[START] Testing Dedicated Shipping API...');

async function testShippingApi() {
  let failed = 0;

  // 1. Test Standard GET /api/mobile/shipping
  console.log('\n[TEST 1] GET /api/mobile/shipping (Standard payload)');
  const req1 = new Request('http://localhost:3000/api/mobile/shipping');
  const res1 = await GET(req1);
  const data1 = await res1.json();

  console.log('Response 1:', JSON.stringify(data1, null, 2));

  if (res1.status !== 200 || !data1.success) {
    console.error('[FAIL] Expected status 200 and success: true');
    failed++;
  } else if (
    typeof data1.deliveryCharge !== 'number' ||
    typeof data1.freeDeliveryThreshold !== 'number' ||
    typeof data1.estimatedDeliveryDays !== 'number' ||
    data1.currency !== 'INR'
  ) {
    console.error('[FAIL] Payload does not match required schema');
    failed++;
  } else {
    console.log('[PASS] Standard shipping payload verified successfully');
  }

  // 2. Test Universal Alias GET /api/shipping
  console.log('\n[TEST 2] GET /api/shipping (Universal alias)');
  const req2 = new Request('http://localhost:3000/api/shipping');
  const res2 = await universalGET(req2);
  const data2 = await res2.json();

  if (res2.status !== 200 || data2.deliveryCharge !== data1.deliveryCharge) {
    console.error('[FAIL] Universal shipping route did not return matching payload');
    failed++;
  } else {
    console.log('[PASS] Universal shipping route returns matching payload');
  }

  // 3. Test Dynamic Cart Calculation: Subtotal below threshold (?subtotal=500)
  console.log('\n[TEST 3] GET /api/mobile/shipping?subtotal=500 (Below threshold)');
  const req3 = new Request('http://localhost:3000/api/mobile/shipping?subtotal=500');
  const res3 = await GET(req3);
  const data3 = await res3.json();

  if (data3.deliveryCharge !== data1.deliveryCharge || data3.isFreeDelivery !== false) {
    console.error('[FAIL] Expected delivery charge and isFreeDelivery: false for subtotal 500');
    failed++;
  } else if (data3.amountNeededForFreeDelivery !== 499) {
    console.error('[FAIL] Expected amountNeededForFreeDelivery: 499, got', data3.amountNeededForFreeDelivery);
    failed++;
  } else {
    console.log('[PASS] Dynamic fee below threshold verified (charge applied)');
  }

  // 4. Test Dynamic Cart Calculation: Subtotal above threshold (?subtotal=1200)
  console.log('\n[TEST 4] GET /api/mobile/shipping?subtotal=1200 (Above threshold)');
  const req4 = new Request('http://localhost:3000/api/mobile/shipping?subtotal=1200');
  const res4 = await GET(req4);
  const data4 = await res4.json();

  if (data4.deliveryCharge !== 0 || data4.isFreeDelivery !== true) {
    console.error('[FAIL] Expected deliveryCharge: 0 and isFreeDelivery: true for subtotal 1200');
    failed++;
  } else {
    console.log('[PASS] Free delivery qualification verified (charge = 0)');
  }

  if (failed > 0) {
    console.error(`\n[ERROR] ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\n[DONE] ALL SHIPPING API TESTS PASSED 100%!');
  }
}

testShippingApi().catch((err) => {
  console.error('[FATAL] Test runner encountered error:', err);
  process.exit(1);
});
