export type BuiltInRole =
  | 'alpha_admin'
  | 'admin'
  | 'products_manager'
  | 'content_manager'
  | 'marketing_associate'
  | 'customer_support'
  | 'user';

export type UserRole = BuiltInRole | (string & {});

export type Permission =
  // Master & System
  | 'manage_team'
  | 'manage_settings'
  | 'view_analytics'
  | 'delete_data'
  // Catalog & Inventory
  | 'manage_products'
  | 'products:view'
  | 'products:edit'
  | 'products:delete'
  | 'manage_categories'
  // Content & Creatives
  | 'manage_content'
  | 'content:view'
  | 'content:edit'
  | 'content:delete'
  // Marketing & Growth
  | 'manage_marketing'
  | 'promotions:view'
  | 'promotions:edit'
  | 'coupons:view'
  | 'coupons:edit'
  | 'manage_rewards'
  | 'rewards:view'
  | 'rewards:edit'
  | 'send_campaigns'
  | 'notifications:view'
  | 'notifications:send'
  | 'email_campaigns:send'
  // Customer & Sales Support
  | 'manage_orders'
  | 'orders:view'
  | 'orders:edit'
  | 'orders:delete'
  | 'manage_invoices'
  | 'invoices:view'
  | 'invoices:create'
  | 'invoices:edit'
  | 'invoices:delete'
  | 'view_customers'
  | 'users:view'
  | 'users:edit'
  | 'users:delete'
  | 'users:manage_roles'
  | 'manage_support';

export const ALPHA_ADMIN_EMAIL = 'rbaskeydomi2018@gmail.com';

export const ALL_STAFF_ROLES: BuiltInRole[] = [
  'alpha_admin',
  'admin',
  'products_manager',
  'content_manager',
  'marketing_associate',
  'customer_support',
];

export const ALL_ROLES: BuiltInRole[] = [...ALL_STAFF_ROLES, 'user'];

export interface CustomRole {
  id: string;
  name: string;
  title?: string;
  description: string;
  color: string;
  badgeClassName: string;
  colorTheme?: string;
  permissions: Permission[];
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userCount?: number;
  isCustom: boolean;
}

export const CUSTOM_ROLE_COLOR_THEMES: Record<string, {
  label: string;
  color: string;
  badgeClassName: string;
  accentBg: string;
}> = {
  indigo: {
    label: 'Indigo Deep',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    badgeClassName: 'bg-indigo-600 text-white font-semibold border-indigo-500/40',
    accentBg: 'bg-indigo-500',
  },
  cyan: {
    label: 'Cyan Neon',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    badgeClassName: 'bg-cyan-600 text-white font-semibold border-cyan-500/40',
    accentBg: 'bg-cyan-500',
  },
  fuchsia: {
    label: 'Fuchsia Vibrant',
    color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    badgeClassName: 'bg-fuchsia-600 text-white font-semibold border-fuchsia-500/40',
    accentBg: 'bg-fuchsia-500',
  },
  teal: {
    label: 'Teal Modern',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    badgeClassName: 'bg-teal-600 text-white font-semibold border-teal-500/40',
    accentBg: 'bg-teal-500',
  },
  orange: {
    label: 'Orange Sunset',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    badgeClassName: 'bg-orange-600 text-white font-semibold border-orange-500/40',
    accentBg: 'bg-orange-500',
  },
  emerald: {
    label: 'Emerald Forest',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeClassName: 'bg-emerald-600 text-white font-semibold border-emerald-500/40',
    accentBg: 'bg-emerald-500',
  },
  rose: {
    label: 'Rose Velvet',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    badgeClassName: 'bg-rose-600 text-white font-semibold border-rose-500/40',
    accentBg: 'bg-rose-500',
  },
  amber: {
    label: 'Amber Gold',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    badgeClassName: 'bg-amber-600 text-white font-semibold border-amber-500/40',
    accentBg: 'bg-amber-500',
  },
  violet: {
    label: 'Violet Royal',
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    badgeClassName: 'bg-violet-600 text-white font-semibold border-violet-500/40',
    accentBg: 'bg-violet-500',
  },
};

export const ROLE_PERMISSIONS: Record<BuiltInRole, Permission[]> = {
  alpha_admin: [
    'manage_team',
    'manage_settings',
    'view_analytics',
    'delete_data',
    'manage_products',
    'products:view',
    'products:edit',
    'products:delete',
    'manage_categories',
    'manage_content',
    'content:view',
    'content:edit',
    'content:delete',
    'manage_marketing',
    'promotions:view',
    'promotions:edit',
    'coupons:view',
    'coupons:edit',
    'manage_rewards',
    'rewards:view',
    'rewards:edit',
    'send_campaigns',
    'notifications:view',
    'notifications:send',
    'email_campaigns:send',
    'manage_orders',
    'orders:view',
    'orders:edit',
    'orders:delete',
    'manage_invoices',
    'invoices:view',
    'invoices:create',
    'invoices:edit',
    'invoices:delete',
    'view_customers',
    'users:view',
    'users:edit',
    'users:delete',
    'users:manage_roles',
    'manage_support',
  ],
  admin: [
    'manage_settings',
    'view_analytics',
    'delete_data',
    'manage_products',
    'products:view',
    'products:edit',
    'products:delete',
    'manage_categories',
    'manage_content',
    'content:view',
    'content:edit',
    'content:delete',
    'manage_marketing',
    'promotions:view',
    'promotions:edit',
    'coupons:view',
    'coupons:edit',
    'manage_rewards',
    'rewards:view',
    'rewards:edit',
    'send_campaigns',
    'notifications:view',
    'notifications:send',
    'email_campaigns:send',
    'manage_orders',
    'orders:view',
    'orders:edit',
    'orders:delete',
    'manage_invoices',
    'invoices:view',
    'invoices:create',
    'invoices:edit',
    'invoices:delete',
    'view_customers',
    'users:view',
    'users:edit',
    'users:delete',
    'users:manage_roles',
    'manage_support',
  ],
  products_manager: [
    'manage_products',
    'products:view',
    'products:edit',
    'manage_categories',
  ],
  content_manager: [
    'manage_content',
    'content:view',
    'content:edit',
    'content:delete',
  ],
  marketing_associate: [
    'manage_marketing',
    'promotions:view',
    'promotions:edit',
    'coupons:view',
    'coupons:edit',
    'manage_rewards',
    'rewards:view',
    'rewards:edit',
    'send_campaigns',
    'notifications:view',
    'notifications:send',
    'email_campaigns:send',
  ],
  customer_support: [
    'manage_orders',
    'orders:view',
    'orders:edit',
    'manage_invoices',
    'invoices:view',
    'invoices:create',
    'invoices:edit',
    'view_customers',
    'users:view',
    'manage_support',
  ],
  user: [],
};

export interface RoleMetadata {
  id: string;
  label: string;
  title: string;
  category: 'Master' | 'Staff' | 'Customer';
  description: string;
  badgeClassName: string;
  color: string;
  isStaff: boolean;
  isCustom?: boolean;
}

export const ROLE_METADATA: Record<BuiltInRole, RoleMetadata> = {
  alpha_admin: {
    id: 'alpha_admin',
    label: 'Alpha Admin',
    title: 'Alpha Admin',
    category: 'Master',
    description: 'Master Control & Total System Authority (rbaskeydomi2018@gmail.com)',
    badgeClassName: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-bold border-amber-400/50 shadow-xs',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    isStaff: true,
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    title: 'Admin',
    category: 'Staff',
    description: 'Full Administrative Operations & Management Access',
    badgeClassName: 'bg-purple-600 text-white font-semibold border-purple-500/40',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    isStaff: true,
  },
  products_manager: {
    id: 'products_manager',
    label: 'Products Manager',
    title: 'Products Manager',
    category: 'Staff',
    description: 'Catalog, Products, Categories, Sizing & Batch Inventory Control',
    badgeClassName: 'bg-emerald-600 text-white font-semibold border-emerald-500/40',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    isStaff: true,
  },
  content_manager: {
    id: 'content_manager',
    label: 'Content Manager',
    title: 'Content Manager',
    category: 'Staff',
    description: 'Exclusive Posters, Storefront Popups, Trends & Creative Palette',
    badgeClassName: 'bg-rose-600 text-white font-semibold border-rose-500/40',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    isStaff: true,
  },
  marketing_associate: {
    id: 'marketing_associate',
    label: 'Marketing Associate',
    title: 'Marketing Associate',
    category: 'Staff',
    description: 'Promotions, Discount Coupons, Oktocoin Loyalty & Campaigns',
    badgeClassName: 'bg-sky-600 text-white font-semibold border-sky-500/40',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    isStaff: true,
  },
  customer_support: {
    id: 'customer_support',
    label: 'Customer Support',
    title: 'Customer Support',
    category: 'Staff',
    description: 'Order Fulfillment, Customer 360 Inquiries, Invoices & Shipping',
    badgeClassName: 'bg-amber-600 text-white font-semibold border-amber-500/40',
    color: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    isStaff: true,
  },
  user: {
    id: 'user',
    label: 'Customer',
    title: 'Customer',
    category: 'Customer',
    description: 'Standard Shopper Account (Storefront & Mobile App)',
    badgeClassName: 'bg-secondary text-secondary-foreground font-medium border-border',
    color: 'bg-secondary text-secondary-foreground border-border',
    isStaff: false,
  },
};

/**
 * Resolve display metadata for any role (built-in or custom)
 */
export function getRoleMetadata(
  role: string | undefined | null,
  customRoles?: CustomRole[]
): RoleMetadata {
  if (!role) return ROLE_METADATA.user;

  if (ROLE_METADATA[role as BuiltInRole]) {
    return ROLE_METADATA[role as BuiltInRole];
  }

  // Check custom roles list if provided
  if (customRoles && Array.isArray(customRoles)) {
    const found = customRoles.find((c) => c.id === role);
    if (found) {
      return {
        id: found.id,
        label: found.name,
        title: found.name,
        category: 'Staff',
        description: found.description || 'Custom staff role created by Alpha Admin',
        badgeClassName: found.badgeClassName || 'bg-indigo-600 text-white font-semibold border-indigo-500/40',
        color: found.color || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        isStaff: true,
        isCustom: true,
      };
    }
  }

  // Graceful fallback for dynamic custom roles
  const cleanName = role
    .replace(/^custom_/, '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: role,
    label: cleanName,
    title: cleanName,
    category: 'Staff',
    description: 'Custom staff role created by Alpha Admin',
    badgeClassName: 'bg-indigo-600 text-white font-semibold border-indigo-500/40',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    isStaff: true,
    isCustom: true,
  };
}

/**
 * Check if a user is the Master Alpha Admin
 */
export function isAlphaAdmin(
  userOrEmail?: { email?: string; role?: string } | string | null,
  role?: string | null
): boolean {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === 'string') {
    if (userOrEmail.toLowerCase().trim() === ALPHA_ADMIN_EMAIL) return true;
    return role === 'alpha_admin';
  }
  if (userOrEmail.email && userOrEmail.email.toLowerCase().trim() === ALPHA_ADMIN_EMAIL) {
    return true;
  }
  return userOrEmail.role === 'alpha_admin';
}

/**
 * Check if a role belongs to staff (non-customer)
 */
export function isStaffRole(role?: string | null): boolean {
  if (!role || role === 'user') return false;
  return true;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  role: UserRole | string | undefined,
  permission: Permission,
  userEmail?: string,
  customRolePermissions?: Record<string, Permission[]>
): boolean {
  if (userEmail && userEmail.toLowerCase().trim() === ALPHA_ADMIN_EMAIL) {
    return true;
  }
  if (!role) return false;
  if (role === 'alpha_admin') return true;

  if (customRolePermissions && customRolePermissions[role]) {
    return customRolePermissions[role].includes(permission);
  }

  const permissions = (ROLE_PERMISSIONS as Record<string, Permission[]>)[role] || [];
  return permissions.includes(permission);
}

/**
 * Required permissions for specific admin paths
 */
export const ROUTE_PERMISSION_MAP: Record<string, Permission> = {
  '/admin/statistics': 'view_analytics',
  '/admin/products': 'manage_products',
  '/admin/batch-tasks': 'manage_products',
  '/admin/categories': 'manage_categories',
  '/admin/size-charts': 'manage_categories',
  '/admin/orders': 'manage_orders',
  '/admin/invoices': 'manage_invoices',
  '/admin/users': 'view_customers',
  '/admin/custom-designs': 'manage_support',
  '/admin/shipping': 'manage_orders',
  '/admin/promotions': 'manage_marketing',
  '/admin/coupons': 'manage_marketing',
  '/admin/rewards': 'manage_rewards',
  '/admin/posters': 'manage_content',
  '/admin/popups': 'manage_content',
  '/admin/emails': 'send_campaigns',
  '/admin/notifications': 'send_campaigns',
  '/admin/trends': 'manage_content',
  '/admin/palette': 'manage_content',
  '/admin/settings': 'manage_settings',
};

/**
 * Check if a role can access an admin route
 */
export function canAccessAdminRoute(
  role: UserRole | string | undefined,
  pathname: string,
  userEmail?: string,
  customRolePermissions?: Record<string, Permission[]>
): boolean {
  if (userEmail && userEmail.toLowerCase().trim() === ALPHA_ADMIN_EMAIL) {
    return true;
  }
  if (!role || !isStaffRole(role)) {
    return false;
  }
  if (role === 'alpha_admin' || role === 'admin') {
    return true;
  }

  // The Roles & Permissions Matrix tab strictly requires manage_team
  if (pathname.includes('/admin/users') && pathname.includes('tab=permissions')) {
    return hasPermission(role, 'manage_team', userEmail, customRolePermissions);
  }

  // Clean pathname by stripping query strings and hash anchors
  const cleanPath = pathname.split('?')[0].split('#')[0];

  // Base dashboard is accessible by all staff
  if (cleanPath === '/admin') {
    return true;
  }

  // Find matching route prefix
  for (const [route, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    if (cleanPath === route || cleanPath.startsWith(`${route}/`)) {
      return hasPermission(role, permission, userEmail, customRolePermissions);
    }
  }

  return false;
}
