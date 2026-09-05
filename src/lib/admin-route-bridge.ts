export interface AdminBridgeRouteInfo {
  targetHref: string;
  targetName: string;
  isCommonSection: boolean;
  sectionName: string;
  currentArea: 'admin' | 'mobile-admin';
  targetArea: 'admin' | 'mobile-admin';
}

/**
 * Maps the current admin route to its counterpart in mobile-admin and vice-versa,
 * maintaining continuity across all common sections (Orders, Categories, Products,
 * Banners/Promotions, Coupons, Rewards, Custom Designs, and Dashboard).
 */
export function getAdminBridgeRoute(currentPathname: string): AdminBridgeRouteInfo {
  const cleanPath = (currentPathname || '').replace(/\/$/, '') || '/';

  // 1. From Mobile Admin -> Main Admin
  if (cleanPath.startsWith('/mobile-admin')) {
    const subPath = cleanPath.replace(/^\/mobile-admin/, '') || '';

    if (subPath === '' || subPath === '/') {
      return {
        targetHref: '/admin',
        targetName: 'Main Admin',
        isCommonSection: true,
        sectionName: 'Dashboard',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/orders')) {
      return {
        targetHref: '/admin/orders',
        targetName: 'Main Admin Orders',
        isCommonSection: true,
        sectionName: 'Orders',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/categories')) {
      return {
        targetHref: '/admin/categories',
        targetName: 'Main Admin Categories',
        isCommonSection: true,
        sectionName: 'Categories',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/products')) {
      return {
        targetHref: '/admin/products',
        targetName: 'Main Admin Products',
        isCommonSection: true,
        sectionName: 'Products',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/banners')) {
      return {
        targetHref: '/admin/promotions',
        targetName: 'Main Admin Promotions',
        isCommonSection: true,
        sectionName: 'Promotions',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/coupons')) {
      return {
        targetHref: '/admin/coupons',
        targetName: 'Main Admin Coupons',
        isCommonSection: true,
        sectionName: 'Coupons',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/rewards')) {
      return {
        targetHref: '/admin/rewards',
        targetName: 'Main Admin Rewards',
        isCommonSection: true,
        sectionName: 'Rewards',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }
    if (subPath.startsWith('/custom-designs')) {
      return {
        targetHref: '/admin/custom-designs',
        targetName: 'Main Admin Custom Designs',
        isCommonSection: true,
        sectionName: 'Custom Designs',
        currentArea: 'mobile-admin',
        targetArea: 'admin',
      };
    }

    // Default fallback from mobile-admin to main admin
    return {
      targetHref: '/admin',
      targetName: 'Main Admin',
      isCommonSection: false,
      sectionName: 'Dashboard',
      currentArea: 'mobile-admin',
      targetArea: 'admin',
    };
  }

  // 2. From Main Admin -> Mobile Admin
  const subPath = cleanPath.replace(/^\/admin/, '') || '';

  if (subPath === '' || subPath === '/') {
    return {
      targetHref: '/mobile-admin',
      targetName: 'Mobile Admin',
      isCommonSection: true,
      sectionName: 'Dashboard',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/orders')) {
    return {
      targetHref: '/mobile-admin/orders',
      targetName: 'Mobile Orders',
      isCommonSection: true,
      sectionName: 'Orders',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/categories')) {
    return {
      targetHref: '/mobile-admin/categories',
      targetName: 'Mobile Categories',
      isCommonSection: true,
      sectionName: 'Categories',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/products')) {
    return {
      targetHref: '/mobile-admin/products',
      targetName: 'Mobile Products',
      isCommonSection: true,
      sectionName: 'Products',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/promotions')) {
    return {
      targetHref: '/mobile-admin/banners',
      targetName: 'Mobile Hero Banners',
      isCommonSection: true,
      sectionName: 'Banners',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/coupons')) {
    return {
      targetHref: '/mobile-admin/coupons',
      targetName: 'Mobile Coupons',
      isCommonSection: true,
      sectionName: 'Coupons',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/rewards')) {
    return {
      targetHref: '/mobile-admin/rewards',
      targetName: 'Mobile Rewards',
      isCommonSection: true,
      sectionName: 'Rewards',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }
  if (subPath.startsWith('/custom-designs')) {
    return {
      targetHref: '/mobile-admin/custom-designs',
      targetName: 'Mobile Custom Designs',
      isCommonSection: true,
      sectionName: 'Custom Designs',
      currentArea: 'admin',
      targetArea: 'mobile-admin',
    };
  }

  // Non-common sections (e.g. statistics, users, settings, shipping, batch-tasks, emails, etc.)
  return {
    targetHref: '/mobile-admin',
    targetName: 'Mobile Admin',
    isCommonSection: false,
    sectionName: 'Dashboard',
    currentArea: 'admin',
    targetArea: 'mobile-admin',
  };
}
