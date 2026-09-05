import { GET } from '../src/app/api/mobile/policies/route.ts';

console.log('[START] Testing Mobile & Web Policies Backend API...');

async function testPoliciesApi() {
  let failed = 0;

  // 1. Test fetching all policies
  console.log('\n[TEST 1] GET /api/mobile/policies (all policies)');
  const reqAll = new Request('http://localhost:3000/api/mobile/policies');
  const resAll = await GET(reqAll);
  const dataAll = await resAll.json();

  if (resAll.status !== 200 || !dataAll.success) {
    console.error('[FAIL] Expected status 200 and success: true');
    failed++;
  } else if (!dataAll.policies || Object.keys(dataAll.policies).length !== 4) {
    console.error('[FAIL] Expected 4 policies, found', Object.keys(dataAll.policies || {}));
    failed++;
  } else {
    console.log('[PASS] Successfully retrieved all 4 policies and contact info');
  }

  // 2. Test fetching terms-and-conditions
  console.log('\n[TEST 2] GET /api/mobile/policies?type=terms');
  const reqTerms = new Request('http://localhost:3000/api/mobile/policies?type=terms');
  const resTerms = await GET(reqTerms);
  const dataTerms = await resTerms.json();

  if (resTerms.status !== 200 || !dataTerms.policy || dataTerms.policy.id !== 'terms-and-conditions') {
    console.error('[FAIL] Expected terms policy document');
    failed++;
  } else {
    console.log('[PASS] Retrieved terms policy:', dataTerms.policy.title);
    // Verify binding acceptance clause
    const termsJsonStr = JSON.stringify(dataTerms.policy);
    if (!termsJsonStr.includes('acceptance') || !termsJsonStr.includes('Mobile Application')) {
      console.error('[FAIL] Terms missing acceptance or Mobile Application scope');
      failed++;
    } else {
      console.log('[PASS] Verified binding acceptance and mobile app scope in terms');
    }
  }

  // 3. Test fetching return-policy
  console.log('\n[TEST 3] GET /api/mobile/policies?type=return');
  const reqReturn = new Request('http://localhost:3000/api/mobile/policies?type=return');
  const resReturn = await GET(reqReturn);
  const dataReturn = await resReturn.json();

  if (resReturn.status !== 200 || !dataReturn.policy || dataReturn.policy.id !== 'return-policy') {
    console.error('[FAIL] Expected return policy document');
    failed++;
  } else {
    console.log('[PASS] Retrieved return policy:', dataReturn.policy.title);
    const returnJsonStr = JSON.stringify(dataReturn.policy);
    // Verify strict refund condition and cancellation
    if (
      !returnJsonStr.includes('fault') ||
      !returnJsonStr.includes('wrong product was sent') ||
      !returnJsonStr.includes('unboxing video') ||
      !returnJsonStr.includes('accepted')
    ) {
      console.error('[FAIL] Return policy missing required strict refund or cancellation clauses');
      failed++;
    } else {
      console.log('[PASS] Verified strict refund, mandatory unboxing video, and cancellation clauses');
    }
  }

  // 4. Test fetching shipping-policy
  console.log('\n[TEST 4] GET /api/mobile/policies?type=shipping');
  const reqShip = new Request('http://localhost:3000/api/mobile/policies?type=shipping');
  const resShip = await GET(reqShip);
  const dataShip = await resShip.json();

  if (resShip.status !== 200 || !dataShip.policy || dataShip.policy.id !== 'shipping-policy') {
    console.error('[FAIL] Expected shipping policy document');
    failed++;
  } else {
    console.log('[PASS] Retrieved shipping policy:', dataShip.policy.title);
  }

  // 5. Test fetching privacy-policy
  console.log('\n[TEST 5] GET /api/mobile/policies?type=privacy');
  const reqPriv = new Request('http://localhost:3000/api/mobile/policies?type=privacy');
  const resPriv = await GET(reqPriv);
  const dataPriv = await resPriv.json();

  if (resPriv.status !== 200 || !dataPriv.policy || dataPriv.policy.id !== 'privacy-policy') {
    console.error('[FAIL] Expected privacy policy document');
    failed++;
  } else {
    console.log('[PASS] Retrieved privacy policy:', dataPriv.policy.title);
  }

  // 6. Test invalid policy type handling (404)
  console.log('\n[TEST 6] GET /api/mobile/policies?type=invalid_policy_name');
  const reqInvalid = new Request('http://localhost:3000/api/mobile/policies?type=invalid_policy_name');
  const resInvalid = await GET(reqInvalid);
  const dataInvalid = await resInvalid.json();

  if (resInvalid.status !== 404 || dataInvalid.success !== false) {
    console.error('[FAIL] Expected status 404 and success: false for invalid type');
    failed++;
  } else {
    console.log('[PASS] Invalid policy correctly returns 404 with helpful error response');
  }

  if (failed > 0) {
    console.error(`\n[ERROR] ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\n[DONE] ALL POLICIES API TESTS PASSED 100%!');
  }
}

testPoliciesApi().catch((err) => {
  console.error('[FATAL] Test runner encountered error:', err);
  process.exit(1);
});
