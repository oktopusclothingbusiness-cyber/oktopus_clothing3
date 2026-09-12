'use client';

import * as React from 'react';
import {
  Bell,
  Send,
  Users,
  User,
  Sliders,
  Smartphone,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  Tag,
  ShoppingBag,
  Gift,
  Palette,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminPushNotificationPage() {
  const { toast } = useToast();

  // Audience State
  const [targetAudience, setTargetAudience] = React.useState<'broadcast' | 'user' | 'segment'>('broadcast');
  const [targetUserId, setTargetUserId] = React.useState('');
  const [segmentFit, setSegmentFit] = React.useState('all');
  const [segmentPalette, setSegmentPalette] = React.useState('all');
  const [segmentFocus, setSegmentFocus] = React.useState('all');

  // Content State
  const [title, setTitle] = React.useState('🔥 LIMITED DROP: Feluda Oversized Tee');
  const [messageBody, setMessageBody] = React.useState('Only 50 numbered pieces available. Tap to grab yours now!');
  const [imageUrl, setImageUrl] = React.useState('https://i.ibb.co/7dbBzQ2L/promo-okto-test1.jpg');

  // Deep Link State
  const [targetScreen, setTargetScreen] = React.useState<string>('product');
  const [productId, setProductId] = React.useState('68ab4f0593d6e024bf740533');
  const [selectedCategory, setSelectedCategory] = React.useState('oversized-tees');
  const [customDeepLink, setCustomDeepLink] = React.useState('');

  // Categories list state
  const [categories, setCategories] = React.useState<{ id: string; name: string; slug: string }[]>([]);

  // Sending & Stats state
  const [sending, setSending] = React.useState(false);
  const [stats, setStats] = React.useState<{
    totalUsers: number;
    activePushSubscribers: number;
    recentLogs: any[];
  }>({
    totalUsers: 0,
    activePushSubscribers: 0,
    recentLogs: [],
  });
  const [loadingStats, setLoadingStats] = React.useState(true);

  // Compute actual deep link string
  const computedDeepLink = React.useMemo(() => {
    switch (targetScreen) {
      case 'product':
        return productId.trim() ? `/product/${productId.trim()}` : '/product';
      case 'category':
        return selectedCategory ? `/category/${selectedCategory}` : '/category';
      case 'orders':
        return '/orders';
      case 'rewards':
        return '/rewards';
      case 'customize':
        return '/customize';
      case 'cart':
        return '/cart';
      case 'custom':
        return customDeepLink.trim() || '/';
      default:
        return '/';
    }
  }, [targetScreen, productId, selectedCategory, customDeepLink]);

  // Load stats and categories on mount
  const fetchMetadata = React.useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, catRes] = await Promise.all([
        fetch('/api/admin/notifications/push'),
        fetch('/api/categories'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          activePushSubscribers: data.activePushSubscribers || 0,
          recentLogs: data.recentLogs || [],
        });
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) {
          setCategories(
            catData.map((c: any) => ({
              id: c._id || c.id || c.slug,
              name: c.name || c.title,
              slug: c.slug || c.id,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load notification stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Handle Dispatch Push Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !messageBody.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please enter a notification Title and Message Body.',
        variant: 'destructive',
      });
      return;
    }

    if (targetAudience === 'user' && !targetUserId.trim()) {
      toast({
        title: 'User Target Missing',
        description: 'Please specify a User ID, Email, or Mobile Number.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const payload = {
        targetAudience,
        targetUserId: targetAudience === 'user' ? targetUserId.trim() : undefined,
        segmentFilter:
          targetAudience === 'segment'
            ? { fit: segmentFit, palette: segmentPalette, focus: segmentFocus }
            : undefined,
        title: title.trim(),
        body: messageBody.trim(),
        imageUrl: imageUrl.trim() || undefined,
        deepLink: computedDeepLink,
      };

      const res = await fetch('/api/admin/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: '🚀 Push Notification Dispatched!',
          description: data.message || `Successfully sent to ${data.successfulSent} devices.`,
        });
        // Refresh logs and subscriber metrics
        fetchMetadata();
      } else {
        toast({
          title: 'Push Dispatch Failed',
          description: data.message || 'An error occurred while sending push notifications.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: error?.message || 'Failed to communicate with push notification server.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Mobile App Push Notification Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast announcement drops, flash sales, and targeted push notifications directly to iOS & Android mobile devices (`okto_app`).
          </p>
        </div>

        {/* SUBSCRIBER BADGES */}
        <div className="flex items-center gap-3">
          <div className="bg-card border rounded-lg px-3 py-2 text-right shadow-xs">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Push Subscribers</p>
            <p className="text-lg font-extrabold text-primary flex items-center justify-end gap-1.5">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : stats.activePushSubscribers}
              <span className="text-xs font-normal text-muted-foreground">/ {stats.totalUsers} users</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: FORM CONTROLS (7 COLS) */}
        <form onSubmit={handleSendNotification} className="lg:col-span-7 space-y-6">
          {/* STEP 1: TARGET AUDIENCE SELECTOR */}
          <Card className="shadow-xs border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                1. Target Audience Selection
              </CardTitle>
              <CardDescription className="text-xs">
                Select whether to broadcast to all app users, target a specific user, or filter by personalization preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={targetAudience}
                onValueChange={(val: any) => setTargetAudience(val)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem value="broadcast" id="aud-broadcast" className="peer sr-only" />
                  <Label
                    htmlFor="aud-broadcast"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center transition-all"
                  >
                    <Users className="h-5 w-5 mb-1.5 text-primary" />
                    <span className="text-xs font-bold">Broadcast All</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">All mobile app users</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="user" id="aud-user" className="peer sr-only" />
                  <Label
                    htmlFor="aud-user"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center transition-all"
                  >
                    <User className="h-5 w-5 mb-1.5 text-primary" />
                    <span className="text-xs font-bold">Single User</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">ID, Email, or Mobile</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="segment" id="aud-segment" className="peer sr-only" />
                  <Label
                    htmlFor="aud-segment"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center transition-all"
                  >
                    <Sliders className="h-5 w-5 mb-1.5 text-primary" />
                    <span className="text-xs font-bold">Quiz Segment</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Style & Fit Preferences</span>
                  </Label>
                </div>
              </RadioGroup>

              {/* SINGLE USER INPUT */}
              {targetAudience === 'user' && (
                <div className="pt-2 space-y-1.5 bg-muted/30 p-3 rounded-md border border-dashed">
                  <Label htmlFor="target-user-input" className="text-xs font-medium">
                    Search User (User ID, Email, or Mobile Number)
                  </Label>
                  <Input
                    id="target-user-input"
                    placeholder="e.g. 65c92f... or alex@example.com or +919876543210"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>
              )}

              {/* SEGMENT FILTERS */}
              {targetAudience === 'segment' && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/30 p-3 rounded-md border border-dashed">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Fit Preference</Label>
                    <Select value={segmentFit} onValueChange={setSegmentFit}>
                      <SelectTrigger className="bg-background text-xs h-8">
                        <SelectValue placeholder="All Fits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fits</SelectItem>
                        <SelectItem value="oversized">Oversized Fit</SelectItem>
                        <SelectItem value="regular">Regular Fit</SelectItem>
                        <SelectItem value="slim">Slim Fit</SelectItem>
                        <SelectItem value="boxy">Boxy Heavyweight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Color Palette</Label>
                    <Select value={segmentPalette} onValueChange={setSegmentPalette}>
                      <SelectTrigger className="bg-background text-xs h-8">
                        <SelectValue placeholder="All Palettes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Palettes</SelectItem>
                        <SelectItem value="monochrome">Monochrome / Cyber Dark</SelectItem>
                        <SelectItem value="cyber teal">Cyber Teal</SelectItem>
                        <SelectItem value="pastel">Neon / Pastel</SelectItem>
                        <SelectItem value="earthy">Earthy Neutrals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Category Focus</Label>
                    <Select value={segmentFocus} onValueChange={setSegmentFocus}>
                      <SelectTrigger className="bg-background text-xs h-8">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Focuses</SelectItem>
                        <SelectItem value="tshirts">T-Shirts & Oversized</SelectItem>
                        <SelectItem value="hoodies">Hoodies & Jackets</SelectItem>
                        <SelectItem value="bottoms">Bottoms & Cargos</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: NOTIFICATION CONTENT */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                2. Notification Payload Content
              </CardTitle>
              <CardDescription className="text-xs">
                Draft your push title, message body, and optional image banner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="push-title" className="text-xs font-semibold">
                  Notification Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="push-title"
                  placeholder="e.g. 🔥 LIMITED DROP: Feluda Oversized Tee"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="push-body" className="text-xs font-semibold">
                  Message Body <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="push-body"
                  placeholder="e.g. Only 50 numbered pieces available. Tap to grab yours now!"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  rows={3}
                  maxLength={250}
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="push-image" className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Rich Banner Image URL (Optional)
                  </span>
                  <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP URL</span>
                </Label>
                <Input
                  id="push-image"
                  placeholder="e.g. https://i.ibb.co/7dbBzQ2L/promo-okto-test1.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* STEP 3: DEEP LINK / TARGET SCREEN SELECTOR */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                3. Target Screen & Deep Link Routing
              </CardTitle>
              <CardDescription className="text-xs">
                Specify where tapping this notification inside the mobile app will redirect the user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Mobile Screen</Label>
                  <Select value={targetScreen} onValueChange={setTargetScreen}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select target screen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Details (/product/:id)</SelectItem>
                      <SelectItem value="category">Category Page (/category/:id)</SelectItem>
                      <SelectItem value="orders">My Orders (/orders)</SelectItem>
                      <SelectItem value="rewards">Oktocoins & Rewards (/rewards)</SelectItem>
                      <SelectItem value="customize">Custom Design Studio (/customize)</SelectItem>
                      <SelectItem value="cart">Shopping Cart (/cart)</SelectItem>
                      <SelectItem value="custom">Custom Deep Link Path</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* DYNAMIC SCREEN SPECIFIC INPUT */}
                {targetScreen === 'product' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="product-id-input" className="text-xs font-semibold">
                      Product ID
                    </Label>
                    <Input
                      id="product-id-input"
                      placeholder="e.g. 68ab4f0593d6e024bf740533"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                )}

                {targetScreen === 'category' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category Selection</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.name} ({cat.slug})
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="oversized-tees">Oversized Tees</SelectItem>
                            <SelectItem value="hoodies">Hoodies</SelectItem>
                            <SelectItem value="sweatshirts">Sweatshirts</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {targetScreen === 'custom' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-link-input" className="text-xs font-semibold">
                      Custom Deep Link Path
                    </Label>
                    <Input
                      id="custom-link-input"
                      placeholder="e.g. /promotions/drop-feluda"
                      value={customDeepLink}
                      onChange={(e) => setCustomDeepLink(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                )}
              </div>

              {/* GENERATED DEEP LINK BADGE */}
              <div className="bg-muted/40 p-2.5 rounded-md flex items-center justify-between text-xs border">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  Generated Deep Link Payload:
                </span>
                <code className="font-mono bg-background px-2 py-0.5 rounded text-primary font-bold">
                  {computedDeepLink}
                </code>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 bg-muted/10">
              <Button type="submit" size="lg" className="w-full font-bold gap-2 shadow-md" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dispatching to Expo Push API...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    SEND PUSH NOTIFICATION NOW
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* RIGHT: LIVE SMARTPHONE PUSH PREVIEW & DISPATCH HISTORY (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SMARTPHONE PUSH MOCKUP PREVIEW */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                Live Mobile Device Lock Screen Preview
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time visual mockup of how push alert renders on iOS & Android screens.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-4">
              {/* PHONE CONTAINER */}
              <div className="w-full max-w-[320px] bg-slate-950 text-white rounded-[32px] p-4 shadow-2xl border-4 border-slate-800 relative overflow-hidden font-sans">
                {/* DYNAMIC ISLAND / NOTCH */}
                <div className="w-24 h-4 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
                </div>

                {/* LOCK SCREEN CLOCK */}
                <div className="text-center mb-6">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Saturday, Sept 12</p>
                  <p className="text-3xl font-extrabold text-slate-100 tracking-tight">11:14</p>
                </div>

                {/* PUSH NOTIFICATION CARD */}
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3 shadow-lg space-y-2 transition-all">
                  {/* APP HEADER */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold tracking-wide text-slate-200">
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-[8px] font-mono text-black">
                        OK
                      </div>
                      OKTOPUS CLOTHING
                    </div>
                    <span>now</span>
                  </div>

                  {/* TITLE & BODY */}
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white line-clamp-1 leading-snug">
                      {title || '🔥 Notification Title'}
                    </p>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                      {messageBody || 'Notification body message snippet...'}
                    </p>
                  </div>

                  {/* RICH BANNER IMAGE PREVIEW */}
                  {imageUrl.trim() && (
                    <div className="mt-2 rounded-xl overflow-hidden bg-slate-800 max-h-28 border border-slate-700">
                      {/* eslint-disable-next-html-element-suppression */}
                      <img
                        src={imageUrl.trim()}
                        alt="Push Banner"
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* DEEP LINK TARGET FOOTER */}
                  <div className="pt-1 flex items-center justify-between text-[9px] text-primary font-mono border-t border-slate-800">
                    <span className="truncate">DeepLink: {computedDeepLink}</span>
                    <Badge variant="outline" className="text-[8px] border-primary/50 text-primary py-0 px-1">
                      Tap to open
                    </Badge>
                  </div>
                </div>

                {/* BOTTOM SWIPE BAR */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-8"></div>
              </div>
            </CardContent>
          </Card>

          {/* RECENT DISPATCH LOGS */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Recent Push Dispatch Logs
              </CardTitle>
              <CardDescription className="text-xs">History of recent campaign notifications sent</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentLogs && stats.recentLogs.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {stats.recentLogs.map((log: any, idx: number) => (
                    <div
                      key={log.id || idx}
                      className="p-3 bg-muted/30 border rounded-lg space-y-1.5 text-xs hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate text-foreground max-w-[200px]">{log.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {log.targetAudience}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{log.body}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {log.successfulSent} sent ({log.recipientCount} total)
                        </span>
                        <span>{log.dispatchedAt ? new Date(log.dispatchedAt).toLocaleTimeString() : 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No notification logs found yet. Send your first campaign!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
