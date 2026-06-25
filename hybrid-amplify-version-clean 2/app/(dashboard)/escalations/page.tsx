'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEscalations } from '@/lib/api/escalations';
import { EscalationFilters } from '@/types';
import { formatDate } from '@/lib/utils';

export default function EscalationsPage() {
  const [filters, setFilters] = useState<EscalationFilters>({});
  const { data, isLoading } = useEscalations(filters);

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      S1: 'destructive',
      S2: 'warning',
      S3: 'default',
      S4: 'secondary',
    };
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: 'destructive',
      triaged: 'warning',
      in_progress: 'default',
      resolved: 'success',
      closed: 'secondary',
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityColor = (score: number) => {
    if (score >= 90) return 'text-red-500';
    if (score >= 75) return 'text-orange-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const openEscalations = data?.data?.filter((e) => e.status === 'open' || e.status === 'triaged') || [];
  const inProgressEscalations = data?.data?.filter((e) => e.status === 'in_progress') || [];
  const resolvedEscalations = data?.data?.filter((e) => e.status === 'resolved' || e.status === 'closed') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalations</h1>
          <p className="text-muted-foreground">Manage customer escalations and high-priority issues</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Escalation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openEscalations.length}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressEscalations.length}</div>
            <p className="text-xs text-muted-foreground">Being actively worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedEscalations.length}</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">Mean time to resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Queue */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">
            Open ({openEscalations.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressEscalations.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedEscalations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : openEscalations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No open escalations</p>
              </CardContent>
            </Card>
          ) : (
            openEscalations.map((escalation) => (
              <Card key={escalation.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(escalation.severity)}
                        <span className={`text-2xl font-bold ${getPriorityColor(escalation.aiScore)}`}>
                          {escalation.aiScore}
                        </span>
                        <CardTitle className="text-lg">
                          <Link href={`/escalations/${escalation.id}`} className="hover:underline">
                            {escalation.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {escalation.customerName} • Created {formatDate(escalation.createdAt)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(escalation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {escalation.description}
                  </p>
                  {escalation.assignedTo && (
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Assigned to:</span>{' '}
                      <span className="font-medium">{escalation.assignedTo}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressEscalations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No escalations in progress</p>
              </CardContent>
            </Card>
          ) : (
            inProgressEscalations.map((escalation) => (
              <Card key={escalation.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(escalation.severity)}
                        <span className={`text-2xl font-bold ${getPriorityColor(escalation.aiScore)}`}>
                          {escalation.aiScore}
                        </span>
                        <CardTitle className="text-lg">
                          <Link href={`/escalations/${escalation.id}`} className="hover:underline">
                            {escalation.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {escalation.customerName} • Created {formatDate(escalation.createdAt)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(escalation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {escalation.description}
                  </p>
                  {escalation.assignedTo && (
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Assigned to:</span>{' '}
                      <span className="font-medium">{escalation.assignedTo}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedEscalations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No resolved escalations</p>
              </CardContent>
            </Card>
          ) : (
            resolvedEscalations.map((escalation) => (
              <Card key={escalation.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(escalation.severity)}
                        <CardTitle className="text-lg">
                          <Link href={`/escalations/${escalation.id}`} className="hover:underline">
                            {escalation.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {escalation.customerName} • Resolved {formatDate(escalation.resolvedAt!)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(escalation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {escalation.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
