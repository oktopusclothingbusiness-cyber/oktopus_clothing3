import { getAdminBridgeRoute } from '../src/lib/admin-route-bridge.js';

console.log('[START] Running Admin Route Continuity & Bridge Tests...');

const testCases = [
  // Main Admin -> Mobile Admin
  {
    input: '/admin',
    expectedHref: '/mobile-admin',
    expectedSection: 'Dashboard',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/orders',
    expectedHref: '/mobile-admin/orders',
    expectedSection: 'Orders',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/orders/68ab4f0593d6e024bf740514',
    expectedHref: '/mobile-admin/orders',
    expectedSection: 'Orders',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/categories',
    expectedHref: '/mobile-admin/categories',
    expectedSection: 'Categories',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/products',
    expectedHref: '/mobile-admin/products',
    expectedSection: 'Products',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/promotions',
    expectedHref: '/mobile-admin/banners',
    expectedSection: 'Banners',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/coupons',
    expectedHref: '/mobile-admin/coupons',
    expectedSection: 'Coupons',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/rewards',
    expectedHref: '/mobile-admin/rewards',
    expectedSection: 'Rewards',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/custom-designs',
    expectedHref: '/mobile-admin/custom-designs',
    expectedSection: 'Custom Designs',
    expectedCommon: true,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/statistics',
    expectedHref: '/mobile-admin',
    expectedCommon: false,
    expectedTargetArea: 'mobile-admin',
  },
  {
    input: '/admin/users',
    expectedHref: '/mobile-admin',
    expectedCommon: false,
    expectedTargetArea: 'mobile-admin',
  },

  // Mobile Admin -> Main Admin
  {
    input: '/mobile-admin',
    expectedHref: '/admin',
    expectedSection: 'Dashboard',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/orders',
    expectedHref: '/admin/orders',
    expectedSection: 'Orders',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/categories',
    expectedHref: '/admin/categories',
    expectedSection: 'Categories',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/products',
    expectedHref: '/admin/products',
    expectedSection: 'Products',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/banners',
    expectedHref: '/admin/promotions',
    expectedSection: 'Promotions',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/coupons',
    expectedHref: '/admin/coupons',
    expectedSection: 'Coupons',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/rewards',
    expectedHref: '/admin/rewards',
    expectedSection: 'Rewards',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
  {
    input: '/mobile-admin/custom-designs',
    expectedHref: '/admin/custom-designs',
    expectedSection: 'Custom Designs',
    expectedCommon: true,
    expectedTargetArea: 'admin',
  },
];

let failed = 0;
testCases.forEach((tc) => {
  const result = getAdminBridgeRoute(tc.input);

  if (result.targetHref !== tc.expectedHref) {
    console.error(`[FAIL] ${tc.input}: expected href ${tc.expectedHref}, got ${result.targetHref}`);
    failed++;
    return;
  }
  if (result.isCommonSection !== tc.expectedCommon) {
    console.error(`[FAIL] ${tc.input}: expected isCommonSection ${tc.expectedCommon}, got ${result.isCommonSection}`);
    failed++;
    return;
  }
  if (tc.expectedSection && result.sectionName !== tc.expectedSection) {
    console.error(`[FAIL] ${tc.input}: expected sectionName ${tc.expectedSection}, got ${result.sectionName}`);
    failed++;
    return;
  }
  if (result.targetArea !== tc.expectedTargetArea) {
    console.error(`[FAIL] ${tc.input}: expected targetArea ${tc.expectedTargetArea}, got ${result.targetArea}`);
    failed++;
    return;
  }

  console.log(`[PASS] ${tc.input.padEnd(30)} -> ${result.targetHref.padEnd(25)} (${result.sectionName}, common: ${result.isCommonSection})`);
});

// Round trip verification for all common sections
console.log('\n[ROUND-TRIP TEST] Verifying two-way continuity symmetry:');
const commonAdminSections = [
  '/admin',
  '/admin/orders',
  '/admin/categories',
  '/admin/products',
  '/admin/promotions',
  '/admin/coupons',
  '/admin/rewards',
  '/admin/custom-designs',
];

commonAdminSections.forEach((adminPath) => {
  const toMobile = getAdminBridgeRoute(adminPath);
  const backToAdmin = getAdminBridgeRoute(toMobile.targetHref);

  if (backToAdmin.targetHref !== adminPath) {
    console.error(`[FAIL] Round trip broke for ${adminPath} -> ${toMobile.targetHref} -> ${backToAdmin.targetHref}`);
    failed++;
  } else {
    console.log(`[PASS] Round trip: ${adminPath} <-> ${toMobile.targetHref}`);
  }
});

if (failed > 0) {
  console.error(`\n[ERROR] ${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\n[DONE] ALL ADMIN CONTINUITY TESTS PASSED 100%!');
}
