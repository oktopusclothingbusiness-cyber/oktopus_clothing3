'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import {
  UserRole,
  Permission,
  ROLE_METADATA,
  ROLE_PERMISSIONS,
  ALL_STAFF_ROLES,
  ALPHA_ADMIN_EMAIL,
  isAlphaAdmin,
  CustomRole,
  getRoleMetadata,
} from '@/lib/rbac';
import { CustomRoleDialog } from '@/components/admin/custom-role-dialog';
import {
  Shield,
  ShieldCheck,
  Crown,
  Lock,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Shirt,
  Sparkles,
  Megaphone,
  ShoppingBag,
  Sliders,
  Users,
  Package,
  Receipt,
  Ticket,
  Bell,
  Mail,
  BarChart,
  Layers,
  Palette,
  Loader2,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PermissionDefinition {
  key: Permission;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface PermissionGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  permissions: PermissionDefinition[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'catalog',
    title: 'Catalog & Inventory Control',
    description: 'Products catalog, sizing charts, inventory batch tasks and categories',
    icon: Shirt,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    permissions: [
      {
        key: 'manage_products',
        title: 'Master Products Control',
        description: 'Full management of catalog, products, and inventory batch tasks',
        icon: Shirt,
      },
      {
        key: 'products:view',
        title: 'View Catalog & Inventory',
        description: 'Inspect products list, stock quantities, and product details',
        icon: Package,
      },
      {
        key: 'products:edit',
        title: 'Create & Edit Products',
        description: 'Publish new products, edit pricing, variants, and colors',
        icon: Sliders,
      },
      {
        key: 'products:delete',
        title: 'Delete Products',
        description: 'Permanently remove products from catalog and store',
        icon: AlertTriangle,
      },
      {
        key: 'manage_categories',
        title: 'Categories & Size Charts',
        description: 'Create and organize categories, collections, and size guide charts',
        icon: Layers,
      },
    ],
  },
  {
    id: 'content',
    title: 'Content & Storefront Creatives',
    description: 'Exclusive posters, storefront popup announcements, trends and visual palette',
    icon: Sparkles,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    permissions: [
      {
        key: 'manage_content',
        title: 'Master Content Control',
        description: 'Full authority over creative content, banners, and storefront popups',
        icon: Sparkles,
      },
      {
        key: 'content:view',
        title: 'View Creative Content',
        description: 'Browse active exclusive posters, popup schedule, and banners',
        icon: Sparkles,
      },
      {
        key: 'content:edit',
        title: 'Create & Edit Posters & Popups',
        description: 'Create, schedule, and publish posters and store popups',
        icon: Palette,
      },
      {
        key: 'content:delete',
        title: 'Delete Creative Content',
        description: 'Remove posters, banners, and popup campaigns',
        icon: AlertTriangle,
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing, Coupons & Loyalty',
    description: 'Promotions, discount coupons, Oktocoin rewards and push notifications',
    icon: Megaphone,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    permissions: [
      {
        key: 'manage_marketing',
        title: 'Master Marketing Control',
        description: 'Full authority over promotions, discounts, and campaigns',
        icon: Megaphone,
      },
      {
        key: 'promotions:view',
        title: 'View Promotions',
        description: 'Inspect running promotional banners and discount campaigns',
        icon: Megaphone,
      },
      {
        key: 'promotions:edit',
        title: 'Manage Promotions',
        description: 'Create, launch, and edit promotional campaign banners',
        icon: Megaphone,
      },
      {
        key: 'coupons:view',
        title: 'View Discount Coupons',
        description: 'Inspect coupon codes, limits, and redemption statistics',
        icon: Ticket,
      },
      {
        key: 'coupons:edit',
        title: 'Create & Edit Coupons',
        description: 'Generate discount codes, percentage caps, and usage limits',
        icon: Ticket,
      },
      {
        key: 'manage_rewards',
        title: 'Oktocoin Loyalty Rewards',
        description: 'Configure coin icons, exchange rates, and rewards rules',
        icon: Sparkles,
      },
      {
        key: 'rewards:edit',
        title: 'Credit / Debit Oktocoins',
        description: 'Manually adjust user coin balances from customer profile',
        icon: Sparkles,
      },
      {
        key: 'notifications:view',
        title: 'View Push Notification Logs',
        description: 'Inspect mobile subscriber counts and dispatched push history',
        icon: Bell,
      },
      {
        key: 'notifications:send',
        title: 'Broadcast Push Notifications',
        description: 'Send instant push alerts to mobile app users with deep links',
        icon: Bell,
      },
      {
        key: 'send_campaigns',
        title: 'Promotional Email Broadcasts',
        description: 'Send promotional marketing emails to registered customer lists',
        icon: Mail,
      },
    ],
  },
  {
    id: 'orders',
    title: 'Sales, Invoices & Customer Support',
    description: 'Order fulfillment, invoicing, shipment tracking and customer inquiries',
    icon: ShoppingBag,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    permissions: [
      {
        key: 'manage_orders',
        title: 'Master Orders Control',
        description: 'Full control over orders fulfillment, offline orders, and tracking',
        icon: Package,
      },
      {
        key: 'orders:view',
        title: 'View Order Pipeline',
        description: 'Inspect customer orders across web, mobile app, and offline POS',
        icon: Package,
      },
      {
        key: 'orders:edit',
        title: 'Update Order Status & Offline Orders',
        description: 'Change order processing stages, tracking numbers, and create POS orders',
        icon: Package,
      },
      {
        key: 'orders:delete',
        title: 'Delete Customer Orders',
        description: 'Permanently remove orders from the database (restricted)',
        icon: AlertTriangle,
      },
      {
        key: 'manage_invoices',
        title: 'Master Invoices Control',
        description: 'Issue, view, update, and manage official invoices and receipts',
        icon: Receipt,
      },
      {
        key: 'invoices:view',
        title: 'View & Download Invoices',
        description: 'Access invoice records and download printable PDF receipts',
        icon: Receipt,
      },
      {
        key: 'invoices:create',
        title: 'Issue New Invoices',
        description: 'Create and dispatch custom invoice receipts to customers',
        icon: Receipt,
      },
      {
        key: 'invoices:edit',
        title: 'Edit Invoice Records',
        description: 'Update payment status, line items, and invoice remarks',
        icon: Receipt,
      },
      {
        key: 'invoices:delete',
        title: 'Delete Invoice Records',
        description: 'Permanently cancel and remove invoice records',
        icon: AlertTriangle,
      },
      {
        key: 'view_customers',
        title: 'Customer 360 Profiles',
        description: 'Search customer database, inspect login IPs, and fraud moderation',
        icon: Users,
      },
      {
        key: 'manage_support',
        title: 'Custom Designs & Support',
        description: 'Review custom apparel requests, design uploads, and support issues',
        icon: Palette,
      },
    ],
  },
  {
    id: 'admin',
    title: 'Administration & Security',
    description: 'Executive analytics, staff role governance, and system configurations',
    icon: Shield,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    permissions: [
      {
        key: 'view_analytics',
        title: 'Executive Analytics & Revenue',
        description: 'View live sales KPIs, conversion rates, and revenue dashboards',
        icon: BarChart,
      },
      {
        key: 'users:manage_roles',
        title: 'Assign Staff Roles',
        description: 'Promote or change team user roles (Products Manager, Support, etc.)',
        icon: Users,
      },
      {
        key: 'users:edit',
        title: 'Suspend / Reactivate Users',
        description: 'Moderate customer accounts and toggle suspension status',
        icon: Lock,
      },
      {
        key: 'users:delete',
        title: 'Delete User Accounts',
        description: 'Permanently remove user accounts and profile data',
        icon: AlertTriangle,
      },
      {
        key: 'manage_settings',
        title: 'System Settings',
        description: 'Configure store logo, favicon, and system-wide defaults',
        icon: Sliders,
      },
      {
        key: 'delete_data',
        title: 'Destructive Operations',
        description: 'Execute high-level data purge and destructive actions',
        icon: AlertTriangle,
      },
    ],
  },
];

// Built-in configurable staff roles
const BUILT_IN_CONFIGURABLE_ROLES: UserRole[] = [
  'admin',
  'products_manager',
  'content_manager',
  'marketing_associate',
  'customer_support',
];

export function RolePermissionsMatrix() {
  const { user: currentUser, isAlphaAdmin: currentIsAlphaAdmin } = useAuth();
  const { toast } = useToast();

  const isMasterAlpha = isAlphaAdmin(currentUser) || currentIsAlphaAdmin;

  const [selectedRole, setSelectedRole] = React.useState<UserRole>('products_manager');
  const [customRoles, setCustomRoles] = React.useState<CustomRole[]>([]);
  const [permissionsState, setPermissionsState] = React.useState<Record<string, Permission[]>>({
    ...ROLE_PERMISSIONS,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isCustomized, setIsCustomized] = React.useState(false);

  // Custom Role Modal state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [roleToEdit, setRoleToEdit] = React.useState<CustomRole | null>(null);
  const [isDeletingRole, setIsDeletingRole] = React.useState(false);

  // Fetch saved permissions & custom roles
  const fetchPermissionsAndRoles = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles/permissions');
      if (res.ok) {
        const data = await res.json();
        if (data.permissions) {
          setPermissionsState(data.permissions);
          setIsCustomized(Boolean(data.isCustomized));
        }
        if (Array.isArray(data.customRoles)) {
          setCustomRoles(data.customRoles);
        }
      }
    } catch (err) {
      console.error('Failed to load role permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPermissionsAndRoles();
  }, [fetchPermissionsAndRoles]);

  const selectedCustomRole = customRoles.find((c) => c.id === selectedRole);
  const activeRoleMeta = getRoleMetadata(selectedRole, customRoles);
  const currentRolePermissions = permissionsState[selectedRole] || [];

  const handleTogglePermission = (permission: Permission) => {
    setPermissionsState((prev) => {
      const currentList = prev[selectedRole] || [];
      const hasIt = currentList.includes(permission);
      const updatedList = hasIt
        ? currentList.filter((p) => p !== permission)
        : [...currentList, permission];

      return {
        ...prev,
        [selectedRole]: updatedList,
      };
    });
  };

  const handleEnableGroup = (group: PermissionGroup) => {
    const groupPermKeys = group.permissions.map((p) => p.key);
    setPermissionsState((prev) => {
      const currentList = prev[selectedRole] || [];
      const merged = Array.from(new Set([...currentList, ...groupPermKeys]));
      return {
        ...prev,
        [selectedRole]: merged,
      };
    });
  };

  const handleDisableGroup = (group: PermissionGroup) => {
    const groupPermKeys = group.permissions.map((p) => p.key);
    setPermissionsState((prev) => {
      const currentList = prev[selectedRole] || [];
      const filtered = currentList.filter((p) => !groupPermKeys.includes(p));
      return {
        ...prev,
        [selectedRole]: filtered,
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/roles/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: permissionsState }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save role permissions.');
      }

      setIsCustomized(true);
      toast({
        title: 'Permissions Saved',
        description: `Access control rules for all roles have been saved and applied.`,
      });
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.message || 'Could not save role permissions.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/roles/permissions', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to reset role permissions.');
      }

      setPermissionsState({ ...ROLE_PERMISSIONS });
      setIsCustomized(false);
      toast({
        title: 'Reset to Defaults',
        description: 'Built-in role access permissions have been restored to recommended system defaults.',
      });
    } catch (err: any) {
      toast({
        title: 'Reset Failed',
        description: err.message || 'Could not reset permissions.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSaved = (savedRole: CustomRole) => {
    setCustomRoles((prev) => {
      const exists = prev.some((r) => r.id === savedRole.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRole.id ? savedRole : r));
      }
      return [savedRole, ...prev];
    });
    setPermissionsState((prev) => ({
      ...prev,
      [savedRole.id]: savedRole.permissions || [],
    }));
    setSelectedRole(savedRole.id);
  };

  const handleDeleteCustomRole = async () => {
    if (!selectedCustomRole) return;

    try {
      setIsDeletingRole(true);
      const res = await fetch(`/api/admin/roles/custom/${selectedCustomRole.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete custom role.');
      }

      const data = await res.json();
      toast({
        title: 'Role Deleted',
        description: data.message || `Custom role '${selectedCustomRole.name}' deleted.`,
      });

      setCustomRoles((prev) => prev.filter((r) => r.id !== selectedCustomRole.id));
      setSelectedRole('products_manager');
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Could not delete role.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER INFO BANNER */}
      <Card className="border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/5">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl font-bold">
                  Role-Based Access Control (RBAC) Matrix
                </CardTitle>
                {isCustomized ? (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                    Custom Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    System Defaults
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Define and customize exactly which features, operations, and routes each role can access. Master Alpha Admin can also create custom enterprise staff roles.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isMasterAlpha && (
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:brightness-110 shadow-xs"
                  onClick={() => {
                    setRoleToEdit(null);
                    setIsRoleDialogOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Custom Role</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleResetDefaults}
                disabled={saving || loading}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Permissions</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* ALPHA ADMIN PERMANENT NOTICE */}
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-300">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-amber-200">Alpha Admin (Master Control): </span>
              <span>Account </span>
              <span className="font-mono underline text-amber-200">{ALPHA_ADMIN_EMAIL}</span>
              <span> permanently retains master authority, including exclusive rights to create and define custom roles.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROLE SELECTION BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Select Role to Inspect & Configure
          </span>
          {isMasterAlpha && (
            <button
              type="button"
              onClick={() => {
                setRoleToEdit(null);
                setIsRoleDialogOpen(true);
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Role</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* BUILT-IN ROLES */}
          {BUILT_IN_CONFIGURABLE_ROLES.map((role) => {
            const isSelected = selectedRole === role;
            const meta = getRoleMetadata(role);
            const permCount = (permissionsState[role] || []).length;

            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                    : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${meta.color.split(' ')[0]}`} />
                <span className="font-semibold">{meta.title}</span>
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                  {permCount} perms
                </Badge>
              </button>
            );
          })}

          {/* CUSTOM ROLES CREATED BY ALPHA ADMIN */}
          {customRoles.map((role) => {
            const isSelected = selectedRole === role.id;
            const permCount = (permissionsState[role.id] || []).length;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                    : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-semibold">{role.name}</span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] px-1 py-0">
                  Custom
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                  {permCount} perms
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE ROLE SUMMARY BANNER */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${activeRoleMeta.color}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold">{activeRoleMeta.title}</h3>
                  <Badge variant="outline" className={`text-[10px] ${activeRoleMeta.color}`}>
                    {selectedCustomRole ? 'Custom Alpha Role' : `${activeRoleMeta.category} Role`}
                  </Badge>
                  {selectedCustomRole && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-semibold">
                      Created by Alpha Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeRoleMeta.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs font-mono px-2 py-1">
                {currentRolePermissions.length} Active Capabilities
              </Badge>

              {/* CUSTOM ROLE ACTION CONTROLS (ALPHA ADMIN ONLY) */}
              {selectedCustomRole && isMasterAlpha && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setRoleToEdit(selectedCustomRole);
                      setIsRoleDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Role</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDeletingRole}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Custom Role '{selectedCustomRole.name}'?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs space-y-2">
                          <span>
                            Are you sure you want to permanently delete this custom role? Any users currently assigned to this role will be safely reassigned back to the default customer role.
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteCustomRole}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
                        >
                          Confirm Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PERMISSION CAPABILITY GROUPS */}
      <div className="space-y-4">
        {PERMISSION_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const totalInGroup = group.permissions.length;
          const activeInGroup = group.permissions.filter((p) => currentRolePermissions.includes(p.key)).length;
          const allActive = activeInGroup === totalInGroup;
          const someActive = activeInGroup > 0 && !allActive;

          return (
            <Card key={group.id} className="border-border/70 overflow-hidden">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${group.color}`}>
                      <GroupIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{group.title}</h4>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {activeInGroup} / {totalInGroup} enabled
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{group.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => (allActive ? handleDisableGroup(group) : handleEnableGroup(group))}
                    >
                      {allActive ? 'Disable All' : 'Enable All'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {group.permissions.map((perm) => {
                  const isChecked = currentRolePermissions.includes(perm.key);
                  const PermIcon = perm.icon || Shield;

                  return (
                    <div
                      key={perm.key}
                      onClick={() => handleTogglePermission(perm.key)}
                      className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                          : 'border-border/60 bg-card hover:bg-muted/30 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${isChecked ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'}`}>
                          <PermIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs truncate">{perm.title}</span>
                            {isChecked && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {perm.description}
                          </p>
                          <span className="font-mono text-[9px] text-muted-foreground/60 block mt-1">
                            key: {perm.key}
                          </span>
                        </div>
                      </div>

                      <Switch
                        checked={isChecked}
                        onCheckedChange={() => handleTogglePermission(perm.key)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 mt-0.5"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-card/80 sticky bottom-4 shadow-lg backdrop-blur-sm">
        <div className="text-xs text-muted-foreground">
          Modifying permissions for: <span className="font-bold text-foreground">{activeRoleMeta.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleResetDefaults}
            disabled={saving || loading}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save All Permissions</span>
          </Button>
        </div>
      </div>

      {/* CUSTOM ROLE CREATION / EDIT MODAL */}
      <CustomRoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        roleToEdit={roleToEdit}
        onRoleSaved={handleRoleSaved}
      />
    </div>
  );
}
