'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, AlertTriangle, Ticket, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
  {
    name: 'Total Customers',
    value: '2,543',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
  },
  {
    name: 'Active Deals',
    value: '184',
    change: '+8.2%',
    trend: 'up',
    icon: Briefcase,
  },
  {
    name: 'Open Escalations',
    value: '23',
    change: '-5.1%',
    trend: 'down',
    icon: AlertTriangle,
  },
  {
    name: 'Pending Tickets',
    value: '156',
    change: '+3.4%',
    trend: 'up',
    icon: Ticket,
  },
];

const recentEscalations = [
  {
    id: '1',
    title: 'Critical data export issue',
    customer: 'Acme Corp',
    severity: 'S1',
    score: 95,
    status: 'open',
  },
  {
    id: '2',
    title: 'Feature gap: Advanced reporting',
    customer: 'TechStart Inc',
    severity: 'S2',
    score: 82,
    status: 'triaged',
  },
  {
    id: '3',
    title: 'Performance degradation',
    customer: 'Global Systems',
    severity: 'S2',
    score: 78,
    status: 'open',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Escalations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Escalations</CardTitle>
            <CardDescription>High-priority customer escalations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEscalations.map((escalation) => (
                <div
                  key={escalation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{escalation.title}</p>
                    <p className="text-sm text-muted-foreground">{escalation.customer}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={escalation.severity === 'S1' ? 'destructive' : 'warning'}>
                      {escalation.severity}
                    </Badge>
                    <div className="text-sm font-medium">{escalation.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">Create New Customer</div>
                <div className="text-sm text-muted-foreground">Add a new customer to the system</div>
              </button>
              <button className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">Log Escalation</div>
                <div className="text-sm text-muted-foreground">Report a customer escalation</div>
              </button>
              <button className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="font-medium">Search Knowledge Base</div>
                <div className="text-sm text-muted-foreground">Find articles and solutions</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
