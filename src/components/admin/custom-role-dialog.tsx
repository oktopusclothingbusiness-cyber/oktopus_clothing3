'use client';

import * as React from 'react';
import {
  CustomRole,
  CUSTOM_ROLE_COLOR_THEMES,
  Permission,
  isAlphaAdmin,
  ALPHA_ADMIN_EMAIL,
} from '@/lib/rbac';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Crown,
  Shield,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  Layers,
  Palette,
  Megaphone,
  ShoppingBag,
  ShieldAlert,
} from 'lucide-react';

interface CustomRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit?: CustomRole | null;
  onRoleSaved: (savedRole: CustomRole) => void;
}

interface PermissionGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: {
    id: Permission;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'catalog',
    title: 'Catalog & Inventory Control',
    description: 'Products, categories, batch tasks, and size charts',
    icon: Layers,
    permissions: [
      { id: 'manage_products', label: 'Full Catalog Management', description: 'Create, update, and manage products' },
      { id: 'products:view', label: 'View Products Catalog', description: 'Browse and inspect products' },
      { id: 'products:edit', label: 'Edit & Update Products', description: 'Modify prices, descriptions, and stock' },
      { id: 'products:delete', label: 'Delete Products', description: 'Remove products from the catalog' },
      { id: 'manage_categories', label: 'Categories & Size Charts', description: 'Organize taxonomies and size guides' },
    ],
  },
  {
    id: 'content',
    title: 'Content & Storefront Creatives',
    description: 'Exclusive posters, popups, and visual themes',
    icon: Palette,
    permissions: [
      { id: 'manage_content', label: 'Full Creative Control', description: 'Manage posters, popups, and branding' },
      { id: 'content:view', label: 'View Creative Assets', description: 'Inspect active posters and popups' },
      { id: 'content:edit', label: 'Edit & Publish Creatives', description: 'Create or update banners and popups' },
      { id: 'content:delete', label: 'Delete Creatives', description: 'Remove published posters and popups' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing, Coupons & Loyalty',
    description: 'Promotions, discount coupons, and Oktocoins',
    icon: Megaphone,
    permissions: [
      { id: 'manage_marketing', label: 'Marketing Orchestration', description: 'Manage promotions and campaigns' },
      { id: 'promotions:view', label: 'View Promotions', description: 'Inspect active sales and deals' },
      { id: 'promotions:edit', label: 'Create & Edit Promotions', description: 'Configure storefront promotions' },
      { id: 'coupons:view', label: 'View Discount Coupons', description: 'Browse coupons and redemption rates' },
      { id: 'coupons:edit', label: 'Create & Edit Coupons', description: 'Issue discount voucher codes' },
      { id: 'manage_rewards', label: 'Reward Coins Authority', description: 'Configure Oktocoin loyalty rates' },
      { id: 'rewards:view', label: 'View Reward Balances', description: 'Inspect coin distribution' },
      { id: 'rewards:edit', label: 'Adjust Coin Balances', description: 'Credit or debit customer coins' },
      { id: 'send_campaigns', label: 'Broadcast Campaigns', description: 'Send mass emails and push alerts' },
      { id: 'notifications:view', label: 'View Push Alerts', description: 'Inspect notification log' },
      { id: 'notifications:send', label: 'Send Push Notifications', description: 'Trigger app push notifications' },
      { id: 'email_campaigns:send', label: 'Send Email Campaigns', description: 'Dispatch bulk promotional emails' },
    ],
  },
  {
    id: 'sales',
    title: 'Sales, Invoices & Customer Support',
    description: 'Orders, fulfillment, invoices, and customer 360',
    icon: ShoppingBag,
    permissions: [
      { id: 'manage_orders', label: 'Order Fulfillment Control', description: 'Process and ship customer orders' },
      { id: 'orders:view', label: 'View Customer Orders', description: 'Inspect order history and manifests' },
      { id: 'orders:edit', label: 'Update Order Status', description: 'Change fulfillment and dispatch stages' },
      { id: 'orders:delete', label: 'Cancel & Delete Orders', description: 'Void cancelled orders' },
      { id: 'manage_invoices', label: 'Full Invoicing Suite', description: 'Issue, view, and manage tax invoices' },
      { id: 'invoices:view', label: 'View Invoices', description: 'Inspect and download invoices' },
      { id: 'invoices:create', label: 'Create & Issue Invoices', description: 'Generate official tax invoices' },
      { id: 'invoices:edit', label: 'Edit Invoices', description: 'Modify billing line items' },
      { id: 'invoices:delete', label: 'Delete Invoices', description: 'Void issued invoices' },
      { id: 'view_customers', label: 'Customer 360 & Profiles', description: 'Inspect customer profiles & history' },
      { id: 'users:view', label: 'View Accounts Directory', description: 'Browse registered accounts and staff' },
      { id: 'users:edit', label: 'Edit Customer Information', description: 'Update profile details or suspend' },
      { id: 'manage_support', label: 'Customer Support Desk', description: 'Manage inquiries & custom designs' },
    ],
  },
  {
    id: 'admin',
    title: 'Administration & Governance',
    description: 'Security, team assignments, and system settings',
    icon: Shield,
    permissions: [
      { id: 'view_analytics', label: 'Access Business Analytics', description: 'View sales velocity and KPIs' },
      { id: 'manage_settings', label: 'System Configuration', description: 'Manage platform settings' },
      { id: 'users:manage_roles', label: 'Assign Staff Roles', description: 'Change roles of other users' },
      { id: 'users:delete', label: 'Delete User Accounts', description: 'Permanently remove accounts' },
      { id: 'delete_data', label: 'Destructive Data Pruning', description: 'High-privilege data deletion' },
    ],
  },
];

export function CustomRoleDialog({
  open,
  onOpenChange,
  roleToEdit,
  onRoleSaved,
}: CustomRoleDialogProps) {
  const { user, isAlphaAdmin: userIsAlphaAdmin } = useAuth();
  const { toast } = useToast();

  const isMasterAlpha = isAlphaAdmin(user) || userIsAlphaAdmin;

  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [colorTheme, setColorTheme] = React.useState<string>('indigo');
  const [selectedPermissions, setSelectedPermissions] = React.useState<Permission[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (roleToEdit) {
        setName(roleToEdit.name);
        setSlug(roleToEdit.id);
        setDescription(roleToEdit.description || '');
        setColorTheme(roleToEdit.colorTheme || 'indigo');
        setSelectedPermissions(roleToEdit.permissions || []);
      } else {
        setName('');
        setSlug('');
        setDescription('');
        setColorTheme('indigo');
        setSelectedPermissions([]);
      }
    }
  }, [open, roleToEdit]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!roleToEdit) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setSlug(generatedSlug ? `custom_${generatedSlug}` : '');
    }
  };

  const togglePermission = (permId: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupPermIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPermIds.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMasterAlpha) {
      toast({
        title: 'Master Control Required',
        description: `Only Master Alpha Admin (${ALPHA_ADMIN_EMAIL}) can define custom roles.`,
        variant: 'destructive',
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a role name/title.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isEditing = Boolean(roleToEdit);
      const url = isEditing
        ? `/api/admin/roles/custom/${roleToEdit!.id}`
        : `/api/admin/roles/custom`;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        name: name.trim(),
        id: slug.trim(),
        description: description.trim(),
        colorTheme,
        permissions: selectedPermissions,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save custom role');
      }

      toast({
        title: isEditing ? 'Custom Role Updated' : 'Custom Role Created',
        description: `Role "${name}" with ${selectedPermissions.length} permissions has been saved.`,
      });

      onRoleSaved(data.role);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error Saving Role',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTheme = CUSTOM_ROLE_COLOR_THEMES[colorTheme] || CUSTOM_ROLE_COLOR_THEMES.indigo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b bg-card/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {roleToEdit ? 'Edit Custom Role' : 'Create Customizable Role'}
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold">
                  Alpha Admin Exclusive
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Define specialized staff roles, customized badge branding, and granular capability matrices.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isMasterAlpha ? (
          <div className="p-8 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-base font-bold text-foreground">Access Restricted</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Custom staff roles can only be created and defined by the Master Alpha Admin ({ALPHA_ADMIN_EMAIL}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* BASIC DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Role Title / Name</span>
                    <span className="text-[10px] text-muted-foreground">Required</span>
                  </label>
                  <Input
                    placeholder="e.g. Warehouse & Logistics Lead"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Role Identifier / Slug</span>
                    <span className="text-[10px] text-muted-foreground">Internal key</span>
                  </label>
                  <Input
                    placeholder="custom_warehouse_lead"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={Boolean(roleToEdit)}
                    className="h-9 text-xs font-mono bg-muted/40"
                    required
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Role Purpose & Description
                </label>
                <Textarea
                  placeholder="Explain responsibilities, operational scope, and what this role manages..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs min-h-[64px]"
                  rows={2}
                />
              </div>

              {/* COLOR & BRANDING PALETTE */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-card/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Badge Branding Theme</span>
                  </div>
                  {/* LIVE PREVIEW BADGE */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Preview:</span>
                    <Badge className={`text-[10px] font-semibold border ${activeTheme.badgeClassName}`}>
                      {name.trim() || 'Role Preview'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pt-1">
                  {Object.entries(CUSTOM_ROLE_COLOR_THEMES).map(([key, theme]) => {
                    const isSelected = colorTheme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setColorTheme(key)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/40 bg-card shadow-xs'
                            : 'border-border/60 hover:border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${theme.accentBg}`} />
                        <span className="text-[10px] font-medium leading-none capitalize truncate w-full">
                          {key}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PERMISSIONS MATRIX CHECKLIST */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Role Capabilities & Permissions ({selectedPermissions.length} Granted)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] px-2"
                      onClick={() => {
                        const all = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id));
                        setSelectedPermissions(all);
                      }}
                    >
                      Select All
                    </Button>
                    <span className="text-muted-foreground text-xs">•</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] px-2 text-destructive hover:text-destructive"
                      onClick={() => setSelectedPermissions([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {PERMISSION_GROUPS.map((group) => {
                    const Icon = group.icon;
                    const groupPermIds = group.permissions.map((p) => p.id);
                    const selectedCount = groupPermIds.filter((id) =>
                      selectedPermissions.includes(id)
                    ).length;
                    const isAllSelected = selectedCount === groupPermIds.length;

                    return (
                      <div
                        key={group.id}
                        className="rounded-xl border border-border/70 bg-card/30 p-3.5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-muted text-foreground">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{group.title}</h4>
                              <p className="text-[10px] text-muted-foreground">{group.description}</p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => toggleGroup(group)}
                          >
                            {isAllSelected ? 'Disable Group' : `Enable All (${selectedCount}/${groupPermIds.length})`}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {group.permissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'border-primary/50 bg-primary/5 text-foreground'
                                    : 'border-border/50 bg-background/50 hover:bg-muted/40 text-muted-foreground'
                                }`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => togglePermission(perm.id)}
                                  className="mt-0.5"
                                />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                    <span>{perm.label}</span>
                                    {isChecked && (
                                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground leading-tight">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-card/60 flex items-center justify-between sm:justify-between">
              <div className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedPermissions.length}</span> capabilities active
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  )}
                  <span>{roleToEdit ? 'Save Changes' : 'Create Role'}</span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
