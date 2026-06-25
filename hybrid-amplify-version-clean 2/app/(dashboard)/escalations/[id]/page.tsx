'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, User, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEscalation, useSimilarEscalations } from '@/lib/api/escalations';
import { formatDate } from '@/lib/utils';

export default function EscalationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: escalation, isLoading } = useEscalation(id);
  const { data: similarEscalations } = useSimilarEscalations(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!escalation) {
    return <div>Escalation not found</div>;
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/escalations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getSeverityBadge(escalation.severity)}
            <span className={`text-3xl font-bold ${getPriorityColor(escalation.aiScore)}`}>
              {escalation.aiScore}
            </span>
            <h1 className="text-3xl font-bold tracking-tight">{escalation.title}</h1>
          </div>
          <p className="text-muted-foreground">
            <Link href={`/customers/${escalation.customerId}`} className="hover:underline">
              {escalation.customerName}
            </Link>
            {' • '}Created {formatDate(escalation.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(escalation.status)}
          {escalation.status !== 'resolved' && escalation.status !== 'closed' && (
            <Button>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Priority Score</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${getPriorityColor(escalation.aiScore)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPriorityColor(escalation.aiScore)}`}>
              {escalation.aiScore}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {escalation.aiScore >= 90 ? 'Critical Priority' :
               escalation.aiScore >= 75 ? 'High Priority' :
               escalation.aiScore >= 60 ? 'Medium Priority' : 'Low Priority'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {escalation.assignedTo || 'Unassigned'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Open</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {escalation.resolvedAt ?
                `Resolved in ${Math.round((new Date(escalation.resolvedAt).getTime() - new Date(escalation.createdAt).getTime()) / (1000 * 60 * 60))}h` :
                `${Math.round((Date.now() - new Date(escalation.createdAt).getTime()) / (1000 * 60 * 60))}h open`
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="similar">
            Similar Escalations ({similarEscalations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{escalation.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Automated analysis and priority scoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Priority Score Breakdown</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Customer Impact</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Severity Level</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Time Sensitivity</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Similar Escalations (RAG)</CardTitle>
              <CardDescription>
                Semantically similar past escalations using vector search
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!similarEscalations || similarEscalations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No similar escalations found</p>
              ) : (
                <div className="space-y-3">
                  {similarEscalations.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">{result.title}</div>
                        <Badge variant="outline">
                          {Math.round(result.similarity * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Escalation history and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <div className="text-sm font-medium">Escalation Created</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(escalation.createdAt)}
                    </div>
                  </div>
                </div>
                {escalation.status === 'triaged' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">Triaged</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(escalation.updatedAt)}
                      </div>
                    </div>
                  </div>
                )}
                {escalation.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <div className="text-sm font-medium">Resolved</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(escalation.resolvedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
