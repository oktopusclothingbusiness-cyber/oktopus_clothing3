
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { IndianRupee, Users, CreditCard, Activity, ShoppingBag } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';

type Order = {
  _id: string;
  userId: string;
  userName: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

export default function AdminDashboardPage() {
  const { users, loading: usersLoading } = useUser();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalRevenue = React.useMemo(() => {
    return orders
        .filter(order => order.status === 'delivered' || order.status === 'paid')
        .reduce((acc, order) => acc + order.total, 0);
  }, [orders]);
  
  const totalSales = React.useMemo(() => {
     return orders.filter(order => order.status === 'delivered' || order.status === 'paid').length;
  }, [orders]);

  const recentSales = React.useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const salesChartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    return last7Days.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const dailyRevenue = orders
            .filter(order => (order.status === 'delivered' || order.status === 'paid') && order.createdAt.startsWith(dateString))
            .reduce((sum, order) => sum + order.total, 0);
        return {
            date: format(date, 'MMM d'),
            revenue: dailyRevenue,
        }
    });
}, [orders]);


  const loading = usersLoading || ordersLoading;

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>}
            <p className="text-xs text-muted-foreground">From all completed sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{users.length}</div>}
             <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{totalSales}</div>}
            <p className="text-xs text-muted-foreground">Total successful transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>}
            <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Revenue for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart data={salesChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        formatter={(value) => `₹${Number(value).toFixed(2)}`} 
                        indicator="dot" 
                    />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>The 5 most recent orders placed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableBody>
                   {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                           <TableRow key={i}>
                               <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                               <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                           </TableRow>
                       ))
                   ) : recentSales.length > 0 ? (
                       recentSales.map(order => (
                           <TableRow key={order._id}>
                               <TableCell>
                                   <div className="font-medium">{order.userName}</div>
                                   <div className="text-sm text-muted-foreground">#{order._id.slice(-6)}</div>
                               </TableCell>
                               <TableCell className="text-right font-medium">₹{order.total.toFixed(2)}</TableCell>
                           </TableRow>
                       ))
                   ) : (
                       <TableRow>
                           <TableCell colSpan={2} className="text-center h-24">
                               No recent sales.
                           </TableCell>
                       </TableRow>
                   )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
