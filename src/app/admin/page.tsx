
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import Image from 'next/image';

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--secondary))",
  },
};

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <Image src="https://i.pravatar.cc/40?u=a" alt="Avatar" width={40} height={40} className="rounded-full" />
                                <div>
                                    <p className="font-medium">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">+$1,999.00</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                             <div className="flex items-center gap-4">
                                <Image src="https://i.pravatar.cc/40?u=b" alt="Avatar" width={40} height={40} className="rounded-full" />
                                <div>
                                    <p className="font-medium">Jackson Lee</p>
                                    <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">+$39.00</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <Image src="https://i.pravatar.cc/40?u=c" alt="Avatar" width={40} height={40} className="rounded-full" />
                                <div>
                                    <p className="font-medium">Isabella Nguyen</p>
                                    <p className="text-sm text-muted-foreground">isabella.nguyen@email.com</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">+$299.00</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <Image src="https://i.pravatar.cc/40?u=d" alt="Avatar" width={40} height={40} className="rounded-full" />
                                <div>
                                    <p className="font-medium">William Kim</p>
                                    <p className="text-sm text-muted-foreground">will@email.com</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">+$99.00</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <Image src="https://i.pravatar.cc/40?u=e" alt="Avatar" width={40} height={40} className="rounded-full" />
                                <div>
                                    <p className="font-medium">Sofia Davis</p>
                                    <p className="text-sm text-muted-foreground">sofia.davis@email.com</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">+$39.00</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
