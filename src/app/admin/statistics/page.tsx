
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { IndianRupee, Users, Package, TrendingUp, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LocationMap from '@/components/location-map';

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  visitors: { label: "Visitors", color: "hsl(var(--muted-foreground))" }
};
const trafficChartConfig = {
  visitors: { label: "Visitors", color: "hsl(var(--primary))" }
};

type Order = {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    latitude?: number;
    longitude?: number;
  },
  products: {
      name: string;
      price: number;
      quantity: number;
      cost?: number;
  }[];
};

type DailyVisitor = {
  _id: string; // date string 'YYYY-MM-DD'
  count: number;
  hourlyCounts: { [hour: string]: number };
};


export default function StatisticsPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [visitors, setVisitors] = React.useState<DailyVisitor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, visitorsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/visitors?period=all'),
        ]);

        if (!ordersRes.ok) throw new Error('Failed to fetch orders');
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        if (!visitorsRes.ok) throw new Error('Failed to fetch visitors');
        const visitorsData = await visitorsRes.json();
        setVisitors(visitorsData);

      } catch (error) {
        console.error("Failed to fetch statistics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { totalRevenue, totalOrders, netProfit, monthlyVisitors } = React.useMemo(() => {
    const validOrders = orders.filter(order => order.status !== 'rejected');
    const revenue = validOrders.reduce((acc, order) => acc + order.total, 0);
    
    const totalCost = validOrders.reduce((acc, order) => {
        const orderCost = order.products.reduce((productAcc, product) => {
            return productAcc + ((product.cost || 0) * product.quantity);
        }, 0);
        return acc + orderCost;
    }, 0);
    
    const profit = revenue - totalCost;

    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    const monthVisitors = visitors
      .filter(v => new Date(v._id) >= currentMonthStart && new Date(v._id) <= currentMonthEnd)
      .reduce((acc, v) => acc + v.count, 0);

    return {
      totalRevenue: revenue,
      totalOrders: validOrders.length,
      netProfit: profit,
      monthlyVisitors: monthVisitors
    };
  }, [orders, visitors]);

  const salesChartData = React.useMemo(() => {
    const last30Days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    const visitorMap = new Map(visitors.map(v => [v._id, v.count]));

    return last30Days.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const dailyRevenue = orders
            .filter(order => order.status !== 'rejected' && order.createdAt.startsWith(dateString))
            .reduce((sum, order) => sum + order.total, 0);
        return {
            date: format(date, 'MMM d'),
            revenue: dailyRevenue,
            visitors: visitorMap.get(dateString) || 0,
        }
    });
  }, [orders, visitors]);

  const hourlyTrafficData = React.useMemo(() => {
    const hourlyTotals = Array.from({ length: 24 }, () => 0);
    visitors.forEach(day => {
        if(day.hourlyCounts) {
            for (const hour in day.hourlyCounts) {
                hourlyTotals[parseInt(hour)] += day.hourlyCounts[hour];
            }
        }
    });
    return hourlyTotals.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      visitors: count
    }));
  }, [visitors]);

  const orderLocations = React.useMemo(() => {
    return orders
        .filter(order => order.shippingAddress.latitude && order.shippingAddress.longitude)
        .map(order => ({
            latitude: order.shippingAddress.latitude!,
            longitude: order.shippingAddress.longitude!
        }));
  }, [orders]);


  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Statistics</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-8 w-3/4" /></CardContent></Card>
            ))
        ) : (
            <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">From all non-rejected sales</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                     <TooltipProvider>
                        <UiTooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Calculated from product cost at time of sale.</p>
                            </TooltipContent>
                        </UiTooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{netProfit.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Total revenue minus total cost</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalOrders}</div>
                     <p className="text-xs text-muted-foreground">Total non-rejected transactions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{monthlyVisitors}</div>
                    <p className="text-xs text-muted-foreground">Visitors this month</p>
                </CardContent>
            </Card>
            </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue & Visitors Overview</CardTitle>
            <CardDescription>For the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={revenueChartConfig} className="w-full h-[300px]">
              <BarChart data={salesChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip cursor={false} content={<ChartTooltipContent formatter={(value, name) => (name === 'revenue' ? `₹${Number(value).toFixed(2)}` : value)} indicator="dot" />} />
                <Legend />
                <Bar dataKey="revenue" yAxisId="left" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="visitors" yAxisId="right" fill="var(--color-visitors)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
         <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Location Density</CardTitle>
            <CardDescription>Map of where your orders are being shipped.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full p-0 overflow-hidden rounded-b-lg">
             {loading ? <Skeleton className="w-full h-full" /> : 
                orderLocations.length > 0 ? (
                    <LocationMap latitude={orderLocations[0].latitude} longitude={orderLocations[0].longitude} />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No location data available.</div>
                )
             }
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Website Traffic by Time of Day</CardTitle>
                <CardDescription>Aggregated visitor counts by hour.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={trafficChartConfig} className="w-full h-[300px]">
                    <BarChart data={hourlyTrafficData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="hour" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
